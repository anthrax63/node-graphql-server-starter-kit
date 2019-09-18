const check = require('check-types');
const {GraphQLJSONObject} = require('graphql-type-json');

const {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLEnumType
} = require('graphql');

const CustomGraphQLDateType = require('./CustomGraphQLDateType');
const CustomGraphQLDateOnlyType = require('./CustomGraphQLDateOnlyType');
const CustomGraphQLObjectType = require('./CustomGraphQLObjectType');
const {capitalize, deCapitalize, pluralize} = require('../../common/stringHelpers');
const {getServiceForModel} = require('../services/factory');
const {getReferencingModels} = require('../../models/helpers/mongooseSchemaLinks');
const {createListQuery} = require('./crudSchemaMixins');
const models = require('../../models');

const MAX_LEVEL = 4;

function mongooseTypeToGraphQLType(name, pathObj, level = 0, isInput) {
  check.assert.assigned(name, '"name" is required');
  check.assert.assigned(pathObj, '"pathObj" is required');

  if (pathObj.instance === 'Array') {
    let innerType;

    if (pathObj.caster.$isArraySubdocument) {
      innerType = mongooseSchemaToGraphQLType(`${name}${pathObj.path}`, null, pathObj.caster.schema, {}, level + 1);
    } else if (pathObj.caster.instance === 'ObjectID' && pathObj.caster.options.ref && level <= MAX_LEVEL && !isInput) {
      const model = models[capitalize(pathObj.caster.options.ref)];
      const typeName = `${capitalize(name)}View${capitalize(pathObj.path)}`;

      innerType = mongooseModelToGraphQLType(typeName, model, {}, level + 1);
    } else if (pathObj.caster.instance === 'ObjectID' && pathObj.options.ref && level <= MAX_LEVEL && !isInput) {
      const model = models[capitalize(pathObj.options.ref)];
      const typeName = `${capitalize(name)}View${capitalize(pathObj.path)}`;

      innerType = mongooseModelToGraphQLType(typeName, model, {}, level + 1);
    } else {
      innerType = mongooseTypeToGraphQLType(name, pathObj.caster, level);
    }

    return new GraphQLList(innerType);
  } else if (pathObj.instance === 'Embedded') {
    return mongooseSchemaToGraphQLType(`${name}${capitalize(pathObj.path)}`, null, pathObj.caster.schema, {
      ...pathObj.options,
      id: false
    }, level + 1);
  } else if (pathObj.instance === 'ObjectID' && pathObj.options.ref && level <= MAX_LEVEL && !isInput) {
    const model = models[capitalize(pathObj.options.ref)];
    const typeName = `${capitalize(name)}View${capitalize(pathObj.path)}`;

    return mongooseModelToGraphQLType(typeName, model, {}, level + 1);
  } else if (pathObj.instance === 'String' && pathObj.options.enum) {
    const typeName = `${capitalize(name)}View${capitalize(pathObj.path)}Enum`;
    const values = {};

    pathObj.options.enum.forEach((val) => {
      values[val] = {value: val};
    });

    return new GraphQLEnumType({
      name: typeName,
      values
    });
  }

  let options = (pathObj.caster && pathObj.caster.options && pathObj.caster.options.graphQLOptions) ? pathObj.caster.options.graphQLOptions : null;

  if (!options) {
    options = pathObj.options.graphQLOptions || {};
  }

  const typesMap = {
    'ObjectID': GraphQLID,
    'Date': CustomGraphQLDateType,
    'DateOnly': CustomGraphQLDateOnlyType,
    'String': GraphQLString,
    'Number': options.integer ? GraphQLInt : GraphQLFloat,
    'Boolean': GraphQLBoolean,
    'Object': GraphQLJSONObject,
    'Mixed': GraphQLJSONObject
  };

  const type = options.fieldType || pathObj.instance;
  const gType = typesMap[type];

  if (!gType) {
    throw new Error(`Unknown type: ${JSON.stringify(pathObj)} ${JSON.stringify(options)} ${type}`);
  }

  return gType;
}

function mongooseFieldToGraphQLField(name, inputField, level = 0, isInput = false) {
  check.assert.assigned(name, '"name" is required');
  check.assert.object(inputField, '"inputField" should be object');

  const fieldSchema = inputField.caster && inputField.caster.schema ? inputField.caster.schema : inputField;

  let type = mongooseTypeToGraphQLType(name, inputField, level, isInput);

  if (inputField.options.required) {
    type = new GraphQLNonNull(type);
  }

  const fld = {
    type,
    filter: fieldSchema.instance !== 'Embedded' && (fieldSchema.options.graphQLOptions && fieldSchema.options.graphQLOptions.filter !== false),
    sort: true,
    textSearch: fieldSchema.options.graphQLOptions && fieldSchema.options.graphQLOptions.textSearch
  };

  if (fieldSchema.options.ref && !isInput) {
    const Service = getServiceForModel(fieldSchema.options.ref);

    fld.foreign = true;
    fld.resolve = async (parent) => {
      const service = new Service();
      const val = parent[fieldSchema.path];

      if (Array.isArray(val)) {
        return service.getMany({_id: {$in: val}});
      } else {
        return service.get({id: val});
      }
    };

    fld.service = Service;
    fld.filter = true;
  }

  return fld;
}

function mongooseSchemaToGraphQLInputType(name, schema) {
  check.assert.assigned(name, '"name" is required');
  check.assert.assigned(schema, '"schema" is required');

  const paths = Object.keys(schema.paths).filter((p) => !p.startsWith('_'));
  const fields = {};

  paths.forEach((f) => {
    const path = schema.paths[f];
    let options = (path.caster && path.caster.options && path.caster.options.graphQLOptions) ? path.caster.options.graphQLOptions : null;

    if (!options) {
      options = path.options.graphQLOptions || {};
    }

    if (options.hidden) {
      return;
    }

    fields[f] = {...mongooseFieldToGraphQLField(name, path, 0, true), ...options.fields};

    if (options.readOnly) {
      fields[f].setOn = [];
    } else if (options.createOnly) {
      fields[f].setOn = ['create'];
    }
    // fields[f].filter = options.filter;
  });

  return new GraphQLInputObjectType({
    name: capitalize(name),
    fields
  });
}


/**
 * Creates GraphQL type fields using mongoose model
 * @param {string} name
 * @param {object} service
 * @param {object} schema
 * @param {object} options Field options to override
 * @param {number} level
 * @return {object}
 */
function mongooseSchemaToGraphQLType(name, service, schema, options = {}, level = 0) {
  check.assert.assigned(schema, '"schema" is required');
  check.assert.object(schema.paths, '"schema.paths" is required');

  const paths = Object.keys(schema.paths).filter((p) => !p.startsWith('_'));
  let fields = {};

  if (options.id !== false) {
    fields.id = {
      type: new GraphQLNonNull(GraphQLID),
      filter: true
    };
  }

  paths.forEach((f) => {
    const path = schema.paths[f];
    let options = (path.caster && path.caster.options && path.caster.options.graphQLOptions) ? path.caster.options.graphQLOptions : null;

    if (!options) {
      options = path.options.graphQLOptions || {};
    }

    if (options.hidden) {
      return;
    }

    fields[f] = {...mongooseFieldToGraphQLField(name, path, level), ...options.fields};

    if (options.readOnly) {
      fields[f].setOn = [];
    }
    // fields[f].filter = options.filter;
  });

  if (options.injectFields) {
    fields = {
      ...fields,
      ...options.injectFields
    };
  }

  if (level === 0) {
    const refs = getReferencingModels(name);

    Object.keys(refs).forEach((refName) => {
      const ref = refs[refName];

      ref.forEach((refField) => {
        if (options.refNames && options.refNames[refName] === false) {
          return;
        }

        let fieldName = refField + capitalize(pluralize(deCapitalize(refName)));

        if (options.refNames && options.refNames[refName] && options.refNames[refName][refField]) {
          fieldName = options.refNames[refName][refField];
        }

        if (fields[fieldName]) {
          return;
        }

        const typeName = `${capitalize(name)}View${capitalize(fieldName)}`;
        let type;

        if (options.refTypes && options.refTypes[fieldName]) {
          type = options.refTypes[fieldName];
        } else {
          type = mongooseModelToGraphQLType(typeName, models[refName], {}, level + 1);
        }

        const service = getServiceForModel(refName);
        const getContext = (parent) => ({[refField]: parent._id});

        fields[fieldName] = createListQuery(typeName, type, service, null, getContext);
        fields[fieldName].setOn = [];
      });
    });
  }

  return new CustomGraphQLObjectType({
    name: capitalize(name),
    service,
    fields
  });
}


function mongooseModelToGraphQLType(name, model, options = {}, level = 0) {
  check.assert.assigned(model, '"model" is required');
  check.assert.object(model.schema, '"model.schema" is required');

  const service = options.service || getServiceForModel(model.modelName);

  return mongooseSchemaToGraphQLType(name, service, model.schema, options, level);
}

module.exports = mongooseModelToGraphQLType;
module.exports.mongooseSchemaToGraphQLType = mongooseSchemaToGraphQLType;
module.exports.mongooseSchemaToGraphQLInputType = mongooseSchemaToGraphQLInputType;

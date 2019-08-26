const check = require('check-types');
const mongoose = require('mongoose');
const {deCapitalize} = require('../../common/stringHelpers');

// Map where property is referenced model and value is referencing models
const refs = {};

function addRef(referencingModel, referencedModel, fieldName) {
  let ref = refs[referencedModel];
  if (!ref) {
    ref = {};
    refs[referencedModel] = ref;
  }
  let refFields = ref[referencingModel];
  if (!refFields) {
    refFields = [];
    ref[referencingModel] = refFields;
  }
  refFields.push(fieldName);
}

module.exports.linksPlugin = (schema, options) => {
  check.assert.assigned(options, '"options" is required');
  check.assert.nonEmptyString(options.name, '"name" is required option');
  const {name} = options;
  schema.eachPath((pathName) => {
    const path = schema.paths[pathName];
    if (path.options.ref) {
      addRef(name, path.options.ref, pathName);
    }
  });
};

const getReferencingModels = (modelName) => {
  return refs[modelName] || {};
};
module.exports.getReferencingModels = getReferencingModels;

module.exports.getLinks = async (modelName, props) => {
  const id = props.id || props._id;
  if (!id) {
    return null;
  }
  const refs = getReferencingModels(modelName) || {};
  const refNames = Object.keys(refs);
  const refObj = {
    totalCount: 0,
    refs: {}
  };
  for (const refModelName of refNames) {
    const refFields = refs[refModelName];
    const query = refFields.map((f) => ({[f]: id}));
    const ids = await mongoose.model(refModelName).distinct('_id', {$or: query}).exec();
    refObj.totalCount += ids.length;
    refObj.refs[deCapitalize(refModelName)] = ids;
  }
  return refObj;
};

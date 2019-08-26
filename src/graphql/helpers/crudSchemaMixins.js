const {
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} = require('graphql');
const check = require('check-types');
const handleAuth = require('./handleAuth');
const {graphQLArgsToMongoose} = require('./graphQLMongoose');
const queryArgumentsMixin = require('./queryArgumentsMixin');
const filterDataMixin = require('./filterDataMixin');
const linksMixin = require('./linksMixin');
const timestampsMixin = require('./timestampsMixin');
const {capitalize, deCapitalize, pluralize} = require('../../common/stringHelpers');
const log = require('../../common/log');
const CustomGraphQLObjectType = require('./CustomGraphQLObjectType');

const canOn = (arg, actionType, action) => {
  const prop = `${actionType}On`;
  const propValue = arg[prop];
  if (!propValue) {
    return true;
  }
  return propValue.indexOf(action) !== -1;
};

const canSetOn = (arg, action) => canOn(arg, 'set', action);

const canGetOn = (arg, action) => canOn(arg, 'get', action);

const canCreate = (arg) => canSetOn(arg, 'create');

const canUpdate = (arg) => canSetOn(arg, 'update');

const canView = (arg) => canGetOn(arg, 'view');

const filterFields = (obj, callback) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    const fieldValue = obj[key];
    if (callback(key, fieldValue)) {
      const newField = {...fieldValue};
      newObj[key] = newField;
    }
  });
  return newObj;
};

const convertForeign = (obj) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    const fieldValue = obj[key];
    const newField = {...fieldValue};
    if (fieldValue.foreign) {
      if (fieldValue.type.ofType) {
        newField.type = new GraphQLNonNull(GraphQLID);
      } else {
        newField.type = GraphQLID;
      }
      key = `${key}Id`;
    }
    newObj[key] = newField;
  });
  return newObj;
};

const clearRequired = (obj) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    const fieldValue = obj[key];
    const newField = {...fieldValue};
    if (key !== 'id') {
      while (newField.type.ofType && !(newField.type instanceof GraphQLList)) {
        newField.type = newField.type.ofType;
      }
    }
    newObj[key] = newField;
  });
  return newObj;
};

const restoreRefArgs = (args) => {
  const newArgs = {};
  Object.keys(args).forEach((k) => {
    let key = k;
    if (key.endsWith('Id') && key !== 'mosregId' /* Временный костыль */) {
      key = key.slice(0, -2);
    }
    newArgs[key] = args[k];
  });
  return newArgs;
};

const createListQuery = (typeNameCapitalized, type, CrudService, auth, getContext) => {
  const config = type.config;
  const fields = config.fields;
  const fieldsForView = {
    ...filterFields(fields, (name, value) => canView(value)),
    ...timestampsMixin()
  };
  return {
    type: new GraphQLObjectType({
      name: `${pluralize(typeNameCapitalized)}List`,
      fields: {
        totalCount: {type: new GraphQLNonNull(GraphQLInt)},
        skip: {type: new GraphQLNonNull(GraphQLInt)},
        limit: {type: GraphQLInt},
        values: {type: new GraphQLList(type)},
        ...filterDataMixin(typeNameCapitalized, fields, CrudService)
      }
    }),
    args: {
      ...queryArgumentsMixin(pluralize(typeNameCapitalized), fieldsForView)
    },
    async resolve(parent, args, request) {
      const {userInfo} = request;
      if (auth) {
        await handleAuth(userInfo, auth, 'read');
      }
      let context = {};
      if (getContext) {
        context = getContext(parent, args, request);
      }
      const service = new CrudService(context);
      log.debug(
        'fieldsForView, args, parent',
        fieldsForView,
        args,
        parent,
      );
      const mongooseArgs = {
        ...(await graphQLArgsToMongoose(fieldsForView, args, parent))
      };
      log.debug('mongooseArgs', mongooseArgs);
      const totalCount = await service.count(mongooseArgs);
      log.debug('totalCount', totalCount);
      const values = await service.list(mongooseArgs);
      return {
        totalCount,
        values,
        args,
        skip: args.query && args.query.skip || 0,
        limit: args.query && args.query.limit || null
      };
    }
  };
};
module.exports.createListQuery = createListQuery;

module.exports.queryMixin = ({type, auth, getContext}) => {
  check.assert.assigned(type, '"type" is crudService');
  const typeName = type.name;
  check.assert.nonEmptyString(typeName, '"type" should have "name"');
  const config = type.config;
  check.assert.object(config, 'Invalid config. Make sure you use CustomGraphQLObjectType for type definition.');
  const typeNameLower = deCapitalize(typeName);
  const typeNameCapitalized = capitalize(typeNameLower);
  const CrudService = config.service;
  check.assert.assigned(CrudService, '"type" should have property service');
  const fields = config.fields;
  check.assert.assigned(fields, '"type" config should have fields');
  const fieldsForView = {
    ...filterFields(fields, (name, value) => canView(value)),
    ...timestampsMixin()
  };
  const newType = new CustomGraphQLObjectType({
    name: `${typeNameCapitalized}View`,
    service: config.service,
    fields: {
      ...fieldsForView,
      ...linksMixin(typeNameCapitalized)
    }
  });
  return {
    [typeNameLower]: {
      type: new GraphQLObjectType({
        name: `${typeNameCapitalized}Queries`,
        fields: {
          list: createListQuery(typeNameCapitalized, newType, CrudService, auth, getContext),
          get: {
            type: new GraphQLNonNull(newType),
            args: {
              id: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args, request) {
              const {userInfo} = request;
              if (auth) {
                await handleAuth(userInfo, auth, 'read');
              }
              let contextQuery = {};
              if (getContext) {
                contextQuery = getContext(parent, args, request);
              }
              const service = new CrudService(contextQuery);

              return await service.get(args);
            }
          }
        }
      }),
      resolve: () => ({})
    }
  };
};

module.exports.mutationsMixin = ({type, auth, contextRole}) => {
  check.assert.assigned(type, '"type" is required');
  const config = type.config;
  const typeName = type.name;
  check.assert.nonEmptyString(typeName, '"type" should have "name"');
  const typeNameLower = deCapitalize(typeName);
  const typeNameCapitalized = capitalize(typeNameLower);
  const CrudService = config.service;
  check.assert.assigned(CrudService, '"type" should have property service');
  const fields = config.fields;
  check.assert.assigned(fields, '"type" config should have fields');
  const fieldsForCreate = {
    ...convertForeign(
      filterFields(fields, (name, value) => name !== 'id' && canCreate(value)),
    )
  };
  const fieldsForUpdate = {
    ...convertForeign(filterFields(fields, (name, value) => canUpdate(value)))
  };
  const fieldsForMerge = {
    ...convertForeign(
      clearRequired(filterFields(fields, (name, value) => canUpdate(value))),
    )
  };
  return {
    [typeNameLower]: {
      type: new GraphQLObjectType({
        name: `${typeNameCapitalized}Mutations`,
        fields: {
          create: {
            type,
            args: fieldsForCreate,
            async resolve(request, args, {userInfo}) {
              const restoredArgs = restoreRefArgs(args);
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.create(restoredArgs);
            }
          },
          replace: {
            type,
            args: fieldsForUpdate,
            async resolve(request, args, {userInfo}) {
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.replace(restoreRefArgs(args));
            }
          },
          createOrReplace: {
            type,
            args: fieldsForUpdate,
            async resolve(request, args, {userInfo}) {
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.createOrReplace(restoreRefArgs(args));
            }
          },
          createOrMerge: {
            type,
            args: fieldsForUpdate,
            async resolve(request, args, {userInfo}) {
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.createOrMerge(restoreRefArgs(args));
            }
          },
          merge: {
            type,
            args: fieldsForMerge,
            async resolve(request, args, {userInfo}) {
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.merge(restoreRefArgs(args));
            }
          },
          remove: {
            type: GraphQLBoolean,
            args: {
              ids: {type: new GraphQLList(new GraphQLNonNull(GraphQLID))}
            },
            async resolve(request, args, {userInfo}) {
              if (auth) {
                await handleAuth(userInfo, auth, 'write');
              }
              const service = new CrudService();
              return await service.remove(args.ids);
            }
          }
        }
      }),
      resolve: () => ({})
    }
  };
};

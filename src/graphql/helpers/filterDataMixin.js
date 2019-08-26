const {GraphQLObjectType, GraphQLList} = require('graphql');
const {graphQLQueryToMongoose} = require('./graphQLMongoose');
// const log = require('../../../common/log');
const getInputType = (type) => {
  let retType = type;
  while (retType.ofType) {
    retType = retType.ofType;
  }
  return retType;
};

module.exports = function filterDataMixin(typeName, fields, Service) {
  const keys = Object.keys(fields);
  const outFields = {};
  keys.forEach((field) => {
    const val = fields[field];
    if (val.filter && val.foreign) {
      const valType = getInputType(val.type);
      const filterName = `${field}Id`;
      outFields[field + 'Id'] = {
        type: new GraphQLList(valType),
        async resolveValue(parent) {
          if (parent.args && parent.args.filter) {
            const fieldFilter = parent.args.filter[filterName];
            if (fieldFilter) {
              const query = await graphQLQueryToMongoose(null, {
                filter: {
                  id: {
                    in: fieldFilter.in || fieldFilter.nin,
                    eq: fieldFilter.eq || fieldFilter.ne
                  }
                }
              });
              const service = new Service();
              return await service.list({query});
            }
          }
          return [];
        }
      };
    }
  });
  if (Object.keys(outFields).length === 0) {
    return {};
  }
  return {
    filterData: {
      type: new GraphQLObjectType({
        name: `${typeName}FilterData`,
        fields: outFields
      }),
      async resolve(parent, args) {
        const retObj = {};
        const keys = Object.keys(outFields);
        for (const k of keys) {
          retObj[k] = await (outFields[k].resolveValue(parent));
        }
        return retObj;
      }
    }
  };
};

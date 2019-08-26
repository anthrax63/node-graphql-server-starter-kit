const {GraphQLObjectType, GraphQLList, GraphQLID, GraphQLInt, GraphQLNonNull} = require('graphql');
const {getReferencingModels, getLinks} = require('../../models/helpers/mongooseSchemaLinks');
const {deCapitalize} = require('../../common/stringHelpers');

module.exports = function linksMixin(typeName) {
  const fields = getReferencingModels(typeName);
  const keys = Object.keys(fields);
  const outFields = {};
  keys.forEach((field) => {
    outFields[deCapitalize(field)] = {
      type: new GraphQLList(GraphQLID)
    };
  });
  const typeFields = {
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  };
  if (Object.keys(outFields).length > 0) {
    typeFields.refs = {
      type: new GraphQLObjectType({
        name: `${typeName}LinkRefs`,
        fields: outFields
      })
    };
  }
  return {
    links: {
      type: new GraphQLObjectType({
        name: `${typeName}Links`,
        fields: typeFields
      }),
      async resolve(parent, args) {
        return getLinks(typeName, parent);
      }
    }
  };
};

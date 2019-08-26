const check = require('check-types');
const {GraphQLInt, GraphQLInputObjectType, GraphQLString} = require('graphql');
const createFilterArgumentType = require('./createFilterArgumentType');
const SortingDirectionType = require('./SortingDirectionType');


/**
 * Returns an object which can be used for mixing with graphQL query args
 * @param {string} baseName
 * @param {object} fields
 * @return {object}
 */
module.exports = function queryArgumentsMixin(baseName, fields) {
  check.assert.nonEmptyString(baseName, '"baseName" should be a non empty string');
  check.assert.object(fields, '"fields" should be an object');
  const filterFields = {};
  const sortFields = {};
  const keys = Object.keys(fields);
  let hasTextSearchField = false;
  keys.forEach((field) => {
    const val = fields[field];
    const argBaseName = baseName + field.charAt(0).toUpperCase() + field.slice(1);
    check.assert.assigned(val.type, '"type" is required');
    if (val.filter) {
      filterFields[field] = {type: createFilterArgumentType(argBaseName, val)};
    }
    if (val.sort) {
      sortFields[field] = {type: SortingDirectionType};
    }
    if (val.textSearch) {
      hasTextSearchField = true;
    }
  });
  const args = {
    filter: {
      type: new GraphQLInputObjectType({
        name: `${baseName}Filter`,
        fields: filterFields
      })
    },
    sort: {
      type: new GraphQLInputObjectType({
        name: `${baseName}Sort`,
        fields: sortFields
      })
    },
    skip: {
      type: GraphQLInt
    },
    limit: {
      type: GraphQLInt
    }
  };
  if (hasTextSearchField) {
    args.textSearch = {
      type: GraphQLString
    };
  }
  const newType = new GraphQLInputObjectType({
    name: `${baseName}QueryArgs`,
    fields: args
  });
  return {
    query: {
      type: newType
    }
  };
};

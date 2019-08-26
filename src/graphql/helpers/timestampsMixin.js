const {
  GraphQLNonNull
} = require('graphql');
const CustomGraphQLDateType = require('./CustomGraphQLDateType');


module.exports = function timestampsMixin() {
  return {
    createdAt: {type: new GraphQLNonNull(CustomGraphQLDateType), sort: true, filter: true, readonly: true},
    updatedAt: {type: new GraphQLNonNull(CustomGraphQLDateType), sort: true, filter: true, readonly: true}
  };
};

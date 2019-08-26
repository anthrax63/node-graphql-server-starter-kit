const {GraphQLSchema, GraphQLObjectType} = require('graphql');


const index = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...require('./queries/me')
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      ...require('./mutations/signIn'),
      ...require('./mutations/fileUpload'),
      ...require('./mutations/me')
    }
  })
});

module.exports = index;

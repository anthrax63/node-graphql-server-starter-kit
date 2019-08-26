const {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull
} = require('graphql');

const TokenType = new GraphQLObjectType({
  name: 'Token',
  fields: {
    result: {type: new GraphQLNonNull(GraphQLBoolean)},
    token: {type: GraphQLString},
    expiresIn: {type: GraphQLInt}
  }
});

module.exports = TokenType;

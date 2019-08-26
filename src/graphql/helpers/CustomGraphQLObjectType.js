const {GraphQLObjectType} = require('graphql');

class CustomGraphQLObjectType extends GraphQLObjectType {
  constructor(config) {
    super(config);
    this.__config = config;
  }

  get config() {
    if (super.config) {
      return super.config;
    }
    return this.__config;
  }
}

module.exports = CustomGraphQLObjectType;

const {User: UserType} = require('../../models');
const mongooseSchemaToGraphQLType = require('../helpers/mongooseModelToGraphQLType');

module.exports = mongooseSchemaToGraphQLType('User', UserType, {
  refNames: {
    Notification: false
  }
});

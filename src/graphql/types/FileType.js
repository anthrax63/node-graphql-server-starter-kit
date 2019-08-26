const {File: FileType} = require('../../models');
const mongooseSchemaToGraphQLType = require('../helpers/mongooseModelToGraphQLType');

module.exports = mongooseSchemaToGraphQLType('File', FileType);

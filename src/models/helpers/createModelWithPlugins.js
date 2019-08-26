const mongoose = require('mongoose');
const {linksPlugin} = require('./mongooseSchemaLinks');

function createModelWithPlugins(modelName, schema) {
  schema.plugin(linksPlugin, {name: modelName});
  return mongoose.model(modelName, schema);
}

module.exports = createModelWithPlugins;

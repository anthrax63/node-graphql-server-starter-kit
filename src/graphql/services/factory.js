const modelServices = require('.');

function getServiceForModel(modelName) {
  const service = modelServices[modelName] || modelServices[`${modelName}Service`];
  if (!service) {
    throw new Error(`Cant find service for model ${modelName}`);
  }
  return service;
}

module.exports = {getServiceForModel};

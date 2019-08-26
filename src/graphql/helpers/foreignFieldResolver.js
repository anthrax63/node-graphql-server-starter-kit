const check = require('check-types');

/**
 * Creates resolver for GraphQL resolve method
 * @param {string} foreignField Name of property of parent object that is id of foreign type
 * @param {class} ServiceType Service
 * @return {function(*)}
 */
function createResolver(foreignField, ServiceType) {
  check.assert.assigned(foreignField, '"foreignField" is required');
  check.assert.assigned(ServiceType, '"ServiceType" is required');
  const service = new ServiceType();
  return (parent) => {
    const id = parent[foreignField];
    if (!id) {
      return null;
    }
    return service.get({id});
  };
}

module.exports = {
  createResolver
};

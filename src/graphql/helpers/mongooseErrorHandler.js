const {ValidationError} = require('../constants/errors');

module.exports = function handleError(model) {
  const baseError = ValidationError;
  return (error) => {
    return Object.assign({}, baseError, {data: error});
  };
};

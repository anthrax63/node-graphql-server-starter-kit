const check = require('check-types');
const {AuthorizationError} = require('../constants/errors');

function checkAuth(request) {
  check.assert.assigned(request, '"request" is required');
  const userInfo = request.userInfo;
  if (!userInfo || !request.userInfo._id) {
    throw new AuthorizationError({message: 'Token is required for this operation'});
  }
}

function getUserDbContext(request) {
  checkAuth(request);
  return {owner: request.userInfo._id};
}


module.exports = {checkAuth, getUserDbContext};

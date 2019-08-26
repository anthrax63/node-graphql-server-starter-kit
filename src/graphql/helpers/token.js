const check = require('check-types');
const {auth} = require('../../config');
const jwt = require('jsonwebtoken');


function createToken({id, expiresIn}) {
  check.assert.assigned(id, '"id" is required');
  if (expiresIn !== undefined) {
    check.assert.number(expiresIn, '"expiresIn" should be an integer');
  }
  const expTime = expiresIn || auth.tokenExpirationTime;
  const token = jwt.sign({id, type: 'user'}, auth.jwt.secret, {expiresIn: expTime});
  return {
    token,
    expiresIn: expTime
  };
}

module.exports = {
  createToken
};

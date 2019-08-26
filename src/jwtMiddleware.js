const expressJwt = require('express-jwt');
const {auth} = require('./config');


module.exports = () => expressJwt({
  secret: auth.jwt.secret,
  credentialsRequired: false,
  getToken: (req) => req.cookies.id_token
});

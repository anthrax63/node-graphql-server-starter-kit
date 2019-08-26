const modelServices = require('require-all')({
  dirname: __dirname + '/crud',
  filter: /(.+Service)\.js$/i
});

module.exports = modelServices;

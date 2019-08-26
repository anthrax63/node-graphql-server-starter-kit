require('../common/mongooseConnection');
const models = require('require-all')({
  dirname: __dirname + '/schemes',
  filter: (fileName) => {
    if (!/^((?!(spec)).)*.js$/.test(fileName)) {
      return;
    }
    const parts = fileName.split('.');
    return parts[0];
  }
});


module.exports = models;

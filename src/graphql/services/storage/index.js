const config = require('../../../config');

const GoogleStorage = require('./google');


module.exports = {
  google: new GoogleStorage(config.storage.google)
};

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


/**
 * Init new test context
 * @param {string} dbName
 */
async function initContext(dbName) {
  dbName = dbName || `bet-bot-test-${new Date().getTime()}`;
  await mongoose.connect(`mongodb://localhost/${dbName}`, {useNewUrlParser: true});
  return mongoose.connection.db;
}

/**
 * Destroy test context
 * @param {bool} [dropDatabase]
 */
async function destroyContext(dropDatabase = true) {
  if (dropDatabase) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
}


module.exports = {
  initContext,
  destroyContext
};

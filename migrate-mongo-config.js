/* eslint-disable no-useless-escape */
const {dbName, dbHost, dbPort, dbUri} = require('./src/config');

const mongoUrl = dbUri || `mongodb://${dbHost}:${dbPort}/${dbName}`;

const matches = /(.*)\/([^\/]*)$/.exec(mongoUrl);
const databaseName = matches[2];


const config = {
  mongodb: {
    url: mongoUrl,
    databaseName,
    options: {
      useNewUrlParser: true // removes a deprecation warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog'
};

// Return the config as a promise
module.exports = config;

const {dbName, dbHost, dbPort, dbUri} = require('../config');

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
mongoose.Promise = global.Promise;
mongoose.connect(dbUri || `mongodb://${dbHost}:${dbPort}/${dbName}`, {useNewUrlParser: true});
autoIncrement.initialize(mongoose.connection);

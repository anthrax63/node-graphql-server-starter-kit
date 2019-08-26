/* eslint-disable max-len */
const path = require('path');

module.exports.dbHost = process.env.DB_HOST || 'localhost';
module.exports.dbPort = process.env.DB_PORT || 27017;
module.exports.dbName = process.env.DB_NAME || 'gqlstarterkit-dev';
module.exports.dbUri = process.env.MONGODB_URI || '';
module.exports.logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');
module.exports.serverPort = process.env.SERVER_PORT || process.env.PORT || 8080;


module.exports.auth = {
  jwt: {secret: process.env.JWT_SECRET || '123456'},
  tokenExpirationTime: 14 * 24 * 3600,
  google: {
    apiKey: process.env.AUTH_GOOGLE_API_KEY || 'YOUR_KEY_HERE'
  },
  twitter: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY || 'YOUR_KEY_HERE',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'YOUR_KEY_HERE'
  }
};

module.exports.storage = {
  type: process.env.STORAGE_TYPE || 'google',
  local: {
    path: process.env.STORAGE_PATH || '/opt/gqlstarterkit/files',
    maxFileSize: process.env.STORAGE_MAX_FILE_SIZE || 500 * 1024 * 1024,
    temp: process.env.TEMP_PATH || '/opt/gqlstarterkit/tmp'
  },
  google: {
    bucket: process.env.STORAGE_GOOGLE_BUCKET || 'gqlstarterkit',
    projectId: process.env.STORAGE_GOOGLE_PROJECT || 'gqlstarterkit',
    keyFilename: process.env.STORAGE_GOOGLE_KEY_FILE || path.join(__dirname, './config/google/gqlstarterkit.json')
  }
};

module.exports.facebook = {
  appId: process.env.FACEBOOK_APP_ID || 'YOUR_APP_ID',
  appSecret: process.env.FACEBOOK_APP_SECRET || 'YOUR_APP_SECRET'
};


module.exports.emailNotifications = {
  from: process.env.EMAIL_FROM || 'Gqlstarterkit <noreply@gqlstarterkit.pro>',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mandrillapp.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER || 'USER',
      pass: process.env.SMTP_PASSWORD || 'PASSWORD'
    }
  }
};


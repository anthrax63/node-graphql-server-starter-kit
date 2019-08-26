const BaseCloudStorage = require('./base');
const {Storage} = require('@google-cloud/storage');
const check = require('check-types');
const moment = require('moment');

class GoogleCloudStorage extends BaseCloudStorage {
  constructor(options = {}) {
    super();
    check.assert.assigned(options.bucket, '"options.bucket" is required');
    check.assert.assigned(options.projectId, '"options.projectId" is required');
    check.assert.assigned(options.keyFilename, '"options.keyFilename" is required');
    this._options = options;
    this._bucket = new Storage({
      projectId: options.projectId,
      keyFilename: options.keyFilename
    }).bucket(options.bucket);
  }

  async uploadFileFromStream(bucketPath, readStream, options) {
    const writeStream = this._bucket.file(bucketPath).createWriteStream({
      gzip: true,
      public: true,
      contentType: 'auto',
      metadata: {
        name: bucketPath,
        cacheControl: 'public, max-age=31536000'
      }
    });
    await new Promise((resolve, reject) => {
      let statusSent = false;
      const createHandler = (cb) => {
        return (data) => {
          if (statusSent) {
            return;
          }
          statusSent = true;
          cb(data);
        };
      };
      writeStream.once('finish', createHandler(resolve));
      readStream.once('error', createHandler(reject));
      writeStream.once('error', createHandler(reject));
      readStream.pipe(writeStream);
    });
    return true;
  }

  async getPublicDownloadLink(bucketPath) {
    return `https://storage.googleapis.com/${this._options.bucket}/${bucketPath}`;
  }

  // noinspection JSMethodCanBeStatic
  async createSignedDownloadLink(bucketPath, expirationDate) {
    if (!expirationDate) {
      expirationDate = moment().add(20, 'years').toDate();
    }
    const options = {
      action: 'read',
      expires: expirationDate
    };
    const [url] = await this._bucket.file(bucketPath).getSignedUrl(options);
    return url;
  }

  async deleteFile(bucketPath) {
    await this._bucket.file(bucketPath).delete();
    return true;
  }
}

module.exports = GoogleCloudStorage;

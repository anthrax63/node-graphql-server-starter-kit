class BaseCloudStorage {
  // noinspection JSMethodCanBeStatic
  async uploadFileFromStream(bucketPath, readStream, options) {
    throw new Error('Not implemented');
  }

  // noinspection JSMethodCanBeStatic
  async getPublicDownloadLink(bucketPath) {
    throw new Error('Not implemented');
  }
  // noinspection JSMethodCanBeStatic
  async deleteFile(bucketPath) {
    throw new Error('Not implemented');
  }
}


module.exports = BaseCloudStorage;

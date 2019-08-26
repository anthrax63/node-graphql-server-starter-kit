const CrudService = require('./crud');
const fs = require('fs-extra');
const sanitize = require('sanitize-filename');
const {storage: storageConfig} = require('../../../config');
const {NotFoundError} = require('../../constants/errors');
const mime = require('mime');
const StorageFactory = require('../storage');
const randomString = require('randomstring');
const check = require('check-types');
const path = require('path');
const temp = require('temp');
const download = require('download');

const escapeFileName = (fileName) => {
  return sanitize(fileName);
};

class FileService extends CrudService {
  constructor(contextQuery) {
    super('File', contextQuery);
  }


  /**
   * Saves file from path
   * @param {string} fileName
   * @param {ReadableStream} readStream
   * @param {number} size
   * @return {Promise.<Object>}
   */
  async saveFromStream(fileName, readStream, size = 0) {
    const mimeType = mime.getType(fileName);
    const storage = StorageFactory[storageConfig.type];
    if (!storage) {
      throw new Error(`Invalid storage: ${storageConfig.type}`);
    }
    const id = randomString.generate({
      length: 32
    });
    const bucketPath = `${id}/${fileName}`;
    const file = await this.create({name: fileName, size, mimeType, storage: storageConfig.type, path: bucketPath});
    await storage.uploadFileFromStream(bucketPath, readStream);
    file.readySize = size;
    file.ready = true;
    file.link = await storage.getPublicDownloadLink(bucketPath);
    await file.save();
    return file;
  }

  /**
   * Saves file from path
   * @param {string} url
   * @param {string} [fileName]
   * @return {Promise.<Object>}
   */
  async saveFromUrl(url, fileName) {
    check.assert.nonEmptyString(url, '"url" is required');
    if (!fileName) {
      fileName = path.basename(url);
    }
    const tempDir = temp.path();
    const tempFile = path.join(tempDir, fileName);
    await download(url, tempDir, {filename: fileName});
    const stat = await fs.stat(tempFile);
    const readStream = fs.createReadStream(tempFile);
    const file = await this.saveFromStream(fileName, readStream, stat.size);
    await fs.unlink(tempFile);
    return file;
  }

  /**
   * Deletes the file
   * @param {string} id
   * @return {Promise.<void>}
   */
  async deleteFile(id) {
    const storage = StorageFactory[storageConfig.type];
    if (!storage) {
      throw new Error(`Invalid storage: ${storageConfig.type}`);
    }
    const path = await this._getFilePathById(id);
    await storage.deleteFile(path);
  }

  async _getFilePathById(id) {
    const file = await this.get({id});
    if (!file) {
      throw new NotFoundError();
    }
    return file.path;
  }
}

FileService.escapeFileName = escapeFileName;

module.exports = FileService;

const Storage = require('./google');
const path = require('path');
const randomString = require('randomstring');
const should = require('chai').use(require('chai-string')).should();
const fs = require('fs');

const testCredentials = {
  bucket: 'mybucket',
  projectId: 'mybucket',
  keyFilename: path.join(__dirname, './testdata/key.json')
};

const testFile = path.join(__dirname, './testdata/test.txt');

describe('GoogleCloudStorage', function () {
  this.timeout(60000);
  describe('#uploadFileFromStream', () => {
    it('should upload file', async () => {
      const id = randomString.generate({
        length: 32
      });
      const bucketPath = `${id}/test.txt`;
      const storage = new Storage(testCredentials);
      const stream = fs.createReadStream(testFile);
      const result = await storage.uploadFileFromStream(bucketPath, stream);
      result.should.equal(true);
      const link = await storage.getPublicDownloadLink(bucketPath);
      should.exist(link);
      await storage.deleteFile(bucketPath);
    });
  });


  describe('#getPublicDownloadLink', () => {
    it('should return public link', async () => {
      const id = randomString.generate({
        length: 32
      });
      const bucketPath = `${id}/test.txt`;
      const storage = new Storage(testCredentials);
      const stream = fs.createReadStream(testFile);
      const result = await storage.uploadFileFromStream(bucketPath, stream);
      result.should.equal(true);
      const link = await storage.getPublicDownloadLink(bucketPath);
      should.exist(link);
      link.should.startWith('https://storage.googleapis.com/');
      link.should.contain(bucketPath);
      await storage.deleteFile(bucketPath);
    });
  });


  describe('#deleteFile', () => {
    it('should delete the file', async () => {
      const id = randomString.generate({
        length: 32
      });
      const bucketPath = `${id}/test.txt`;
      const storage = new Storage(testCredentials);
      const stream = fs.createReadStream(testFile);
      await storage.uploadFileFromStream(bucketPath, stream);
      const result = await storage.deleteFile(bucketPath);
      result.should.equal(true);
    });
  });
});

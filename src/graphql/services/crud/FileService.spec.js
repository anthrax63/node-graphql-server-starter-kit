const FileService = require('./FileService');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

describe('FileService', function () {
  this.timeout(60000);
  describe('#saveFromUrl', () => {
    it('should save file from url', async () => {
      const fileService = new FileService();
      const testUrl = 'https://lh3.googleusercontent.com/-Sim3pMJ_OLQ/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rfYMFkuyVXk127KKFE8w-d8oc9YPQ/mo/photo.jpg';
      const file = await fileService.saveFromUrl(testUrl);
      should.exist(file);
      file.name.should.equal('photo.jpg');
      file.mimeType.should.equal('image/jpeg');
      file.size.should.be.above(0);
    });

    it('should throw an error if invalid url passed', async () => {
      const fileService = new FileService();
      const testUrl = 'https://lh3.googleusercontent.com/invalid.jpg';
      await fileService.saveFromUrl(testUrl).should.be.rejected;
    });
  });
});

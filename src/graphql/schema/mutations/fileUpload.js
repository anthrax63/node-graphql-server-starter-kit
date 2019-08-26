const FileType = require('../../types/FileType');
const {GraphQLNonNull, GraphQLInt} = require('graphql');
const {checkAuth} = require('../../helpers/auth');
const {GraphQLUpload} = require('graphql-upload');
const FileService = require('../../services/crud/FileService');

module.exports = {
  uploadFile: {
    type: FileType,
    args: {
      file: {type: new GraphQLNonNull(GraphQLUpload)},
      size: {type: GraphQLInt}
    },
    async resolve({request}, {file, size}) {
      checkAuth(request);
      const {filename, createReadStream} = await file;
      const stream = createReadStream();
      const fileService = new FileService();
      return await fileService.saveFromStream(filename, stream, size);
    }
  }
};

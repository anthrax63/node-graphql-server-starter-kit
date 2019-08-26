const fs = require('fs');

async function streamToFile(readStream, destFile) {
  const writeStream = await fs.createWriteStream(destFile);
  return await new Promise((resolve, reject) => {
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
    writeStream.once('close', createHandler(resolve));
    readStream.once('error', createHandler(reject));
    writeStream.once('error', createHandler(reject));
    readStream.pipe(writeStream);
  });
}

module.exports = streamToFile;

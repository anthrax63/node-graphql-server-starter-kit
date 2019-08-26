const fbgraph = require('fbgraph');

function callPromised(func, url, params) {
  return new Promise((resolve, reject) => {
    fbgraph[func](url, params, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

module.exports = {
  get: (...args) => {
    return callPromised('get', ...args);
  },
  post: (...args) => {
    return callPromised('post', ...args);
  }
};

const renameField = (obj, from, to) => {
  obj[to] = obj[from];
  delete obj[from];
  return obj;
};

const deepRenameField = (obj, from, to) => {
  renameField(obj, from, to);
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'object') {
      renameField(obj[key], from, to);
    }
  });
  return obj;
};

module.exports = {
  renameField,
  deepRenameField
};


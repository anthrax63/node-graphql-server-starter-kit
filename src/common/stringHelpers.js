const pluralize = require('pluralize');

function capitalize(word) {
  return word.replace(/\b\w/g, (l) => l.toUpperCase());
}

function deCapitalize(word) {
  return word.replace(/\b\w/g, (l) => l.toLowerCase());
}

function beautifyId(id) {
  let newId = '';
  for (let i = 0; i < id.length; i++) {
    if (i > 0 && i % 6 === 0 && i < id.length - 1) {
      newId += '-';
    }
    newId += id[i].toUpperCase();
  }
  return newId;
}

module.exports = {
  capitalize,
  deCapitalize,
  beautifyId,
  pluralize
};

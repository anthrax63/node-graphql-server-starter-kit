const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  en: {type: String},
  ru: {type: String}
}, {_id: false});

Schema.virtual('fallback').get(function () {
  return this.en || this.ru;
});

module.exports = Schema;

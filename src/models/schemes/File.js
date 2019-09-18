const mongoose = require('mongoose');
const createModelWithPlugins = require('../helpers/createModelWithPlugins');

const Schema = new mongoose.Schema({
  name: {type: String, index: true},
  mimeType: {type: String},
  size: {type: Number, index: true, default: 0},
  readySize: {type: Number, default: 0},
  ready: {type: Boolean, index: true, default: false},
  storage: {type: String, enum: ['google']},
  path: {type: String},
  link: {type: String},
  systemTag: {
    type: String,
    graphQLOptions: {hidden: true, description: 'Used for system files'},
    index: true,
    unique: true,
    sparse: true
  }
});

/* Schema
  .virtual('link')
  .get(function () {
    return this.ready ? `/files/${this.id}/${encodeURIComponent(this.name)}` : null;
  });*/


module.exports = createModelWithPlugins('File', Schema);

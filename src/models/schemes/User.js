const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;
const createModelWithPlugins = require('../helpers/createModelWithPlugins');
const randomatic = require('randomatic');


const Schema = new mongoose.Schema({
  firstName: {type: String, trim: true},
  lastName: {type: String, trim: true},
  login: {type: String, lowercase: true},
  password: {type: String, graphQLOptions: {hidden: true}},
  passwordSalt: {type: String, graphQLOptions: {hidden: true}},
  photo: {type: ObjectId, ref: 'File'},
  googleId: {type: String},
  facebookId: {type: String},
  twitterId: {type: String},
  signInCode: {type: String, graphQLOptions: {hidden: true}},
  signInCodeExpiration: {type: Date, graphQLOptions: {hidden: true}}
});


module.exports = createModelWithPlugins('User', Schema);

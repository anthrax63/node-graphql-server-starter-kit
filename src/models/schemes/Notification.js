const mongoose = require('mongoose');
const createModelWithPlugins = require('../helpers/createModelWithPlugins');
const {Schema} = mongoose;

const NotificationSchema = new Schema({
  type: {type: String, required: true, index: true},
  receiver: {type: Schema.ObjectId, index: true, ref: 'User'},
  email: {type: String, required: true, index: true},
  data: {type: Object, required: true},
  date: {type: Date, required: true, default: Date.now, index: true},
  delivered: {type: Boolean, required: true, default: false, index: true}
});


module.exports = createModelWithPlugins('Notification', NotificationSchema);

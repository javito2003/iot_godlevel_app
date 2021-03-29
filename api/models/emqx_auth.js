const mongoose = require('mongoose');
const Schema = mongoose.Schema

const emqxAuthRuleSchema = new Schema({
  userId : {type: String, required: true},
  dId: {type: String},
  username: {type: String, required: true},
  password: {type: String, required: true},
  publish: {type:Array},
  suscribe: {type: Array},
  type: {type: String, required: true},
  time: {type: Number}
})

const EmqxAuthRule = mongoose.model('EmqxAuthRule', emqxAuthRuleSchema)

module.exports = EmqxAuthRule
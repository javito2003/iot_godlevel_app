const mongoose = require('mongoose')

const Schema = mongoose.Schema


const saverRuleSchmea = new Schema({
    userId: {type: String, required: true},
    dId :{type: String, required: true},
    emqxRuleId :{type: String, required: true},
    status: {type: Boolean, required: true}
})

const saverRule = mongoose.model('SaverRule', saverRuleSchmea)

module.exports = saverRule
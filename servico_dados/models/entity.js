var mongoose = require('mongoose');
var { v4: uuidv4 } = require('uuid');

var entitySchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    name: String,
    ruas: [String]
}, { versionKey: false });

module.exports = mongoose.model('entity', entitySchema, 'entities')
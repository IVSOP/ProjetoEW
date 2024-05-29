var mongoose = require('mongoose');
var { v4: uuidv4 } = require('uuid');

var streetSchema = new mongoose.Schema({
    _id: String,
    name: String
}, { versionKey: false });

var placeSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    name: String,
    ruas: [streetSchema]
}, { versionKey: false });

module.exports = mongoose.model('place', placeSchema, 'places')

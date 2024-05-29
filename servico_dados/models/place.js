var mongoose = require('mongoose');

var streetSchema = new mongoose.Schema({
    _id: Number,
    name: String
}, { _id: false });

var placeSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    ruas: [streetSchema]
}, { versionKey: false });

module.exports = mongoose.model('place', placeSchema, 'places')

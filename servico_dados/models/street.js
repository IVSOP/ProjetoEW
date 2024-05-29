var mongoose = require('mongoose');

var oldImageSchema = new mongoose.Schema({
    _id: Number,
    path: String,
    subst: String
}, { _id: false });

var houseSchema = new mongoose.Schema({
    _id: Number,
    enfiteuta: String,
    subst: String,
    vista: String,
    desc: [String]
}, { _id: false });

var streetSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    description: [String],
    places: [String],
    entities: [String],
    dates: [String],
    old_images: [oldImageSchema],
    houses: [houseSchema],
    new_images: [String]
}, { versionKey: false });

module.exports = mongoose.model('street', streetSchema, 'streets')

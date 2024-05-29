var mongoose = require('mongoose');
var { v4: uuidv4 } = require('uuid');

var oldImageSchema = new mongoose.Schema({
    _id: String,
    path: String,
    subst: String
}, { versionKey: false });

var houseSchema = new mongoose.Schema({
    _id: String,
    enfiteuta: String,
    subst: String,
    vista: String,
    desc: [String]
}, { versionKey: false });

var streetSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
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

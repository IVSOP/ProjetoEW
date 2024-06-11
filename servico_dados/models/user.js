var mongoose = require('mongoose');
var { v4: uuidv4 } = require('uuid');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    username: String,
    password: String,
    name: String,
    level: String,
    active: Boolean,
    dateCreated: String
}, { versionKey: false });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema, 'users')


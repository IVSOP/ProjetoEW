var mongoose = require('mongoose');

var antigoSchema = new mongoose.Schema({
	subst: String,
    extension: String
}, { versionKey: false });

module.exports = mongoose.model('antigo', antigoSchema, 'antigo')

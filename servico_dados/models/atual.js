var mongoose = require('mongoose');

var atualSchema = new mongoose.Schema({
	subst: String,
    extension: String
}, { versionKey: false });

module.exports = mongoose.model('atual', atualSchema, 'atual')

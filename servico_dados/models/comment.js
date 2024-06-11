var mongoose = require('mongoose');
var { v4: uuidv4 } = require('uuid');

const commentSchema = new mongoose.Schema({
    streetId: String,
    baseCommentId: String, // comentário a que se está a dar reply, se for o caso
    user: {type: String, required: true},
    text: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    likes: [String],
    dislikes: [String]
}, { versionKey: false });

module.exports = mongoose.model('comment', commentSchema, 'comments')


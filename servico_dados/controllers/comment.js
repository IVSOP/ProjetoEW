var Comment = require("../models/comment")
var User = require('../controllers/user')

module.exports.list = () => { // query 
    return Comment
        .find()
        .sort({createdAt: 1})
        .exec()
}

module.exports.findById = async (id) => {
    try {
        let comment = await Comment.findOne({ _id: id }).exec();
        if (!comment) throw new Error('Comment not found');
        
        comment = comment.toObject()
        comment.user = await User.getUser(comment.user);
        comment.replies = await fetchRepliesRecursively(comment);
        
        return comment;
    } catch (error) {
        console.log(error)
        throw new Error('Error fetching comment: ' + error);
    }
}

module.exports.findByStreet = async (street_id) => {
    try {
        const comments = await Comment.find({ streetId: street_id }).select('_id').exec();
        return comments.map(comment => comment._id);
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching comments by street: ' + error);
    }
};

module.exports.insert = comment => {
    return Comment.create(comment)
}

// module.exports.addReply = async (comment_id, reply_id) => {
//     try {

//         const comment = await Comment.findOne({ _id: comment_id }).exec();
//         if (!comment) {
//             throw new Error("Comment not found");
//         }

//         const allComments =  await Comment.findOneAndUpdate(
//             { _id: comment_id},
//             { $push: {replies: reply_id}},
//         );
        
//         console.log("Got final object: ",allComments)
//         return allComments

//     } catch (error) {
//         console.error(error);
//         throw new Error("Error adding reply to comment" + error);
//     }
// }

module.exports.updateComment = (comment_id, comment) => {
    return Comment.findOneAndUpdate({_id: comment_id}, comment, {new: true})
}

module.exports.deleteCommentById = async (id) => {
    try {

        // Delete the comment and its associated replies recursively
        const res = await deleteCommentAndReplies(id);

        return res;
    } catch (error) {
        console.error(error);
        throw new Error("Error deleting comment and replies: " + error);
    }
};

//Aux funcs

//apagar comentario e todos os replies associados 
const deleteCommentAndReplies = async (comment_id) => {
    
    // Find and delete replies associated with the comment
    const repliesToDelete = await Comment.find({ baseCommentId: comment_id }, {_id: 1}).exec();
    console.log(repliesToDelete)
    for (let reply of repliesToDelete) {
        await deleteCommentAndReplies(reply._id.toString());
    }

    // Delete the comment itself
    const comment = Comment.findOneAndDelete({ _id: comment_id });
    if (!comment) {
        throw new Error("Comment not found");
    }
    return comment
};

//obter dados extensis de user e replies de comentario, recursivamente
const fetchRepliesRecursively = async (comment) => {
    const replies = await Comment.find({ baseCommentId: comment._id}).exec();
    for (let i = 0; i < replies.length; i++) {
        replies[i] = replies[i].toObject();
        replies[i].user = await User.getUser(replies[i].user);
        replies[i].replies = await fetchRepliesRecursively(replies[i]);
    }
    return replies;
};
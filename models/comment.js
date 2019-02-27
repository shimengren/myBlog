const CommentModel = require("../lib/mongdb").Comment;
const UserModel = require("../lib/mongdb").User;
const marked = require("marked");

CommentModel.plugin("contentToHtml",{
  afterFind:function(comments){
    return comments.map(function(item){
      return {...item, comment:marked(item.comment)}
    });
  }
});
module.exports = {
   createComment:function(comment){
      return CommentModel.create(comment).exec();
   },
   findAllComments:function(postId){
      return CommentModel.find({blogId:postId}).populate({path:'author',model:'User'}).contentToHtml().addCreatedAt().sort({_id:-1}).exec();
   },
   findCommentById(commentId){
      return CommentModel.findOne({_id:commentId}).populate({path:'author',model:'User'}).contentToHtml().addCreatedAt().exec();
   },
   commentNum(blogId){
     return CommentModel.countDocuments({blogId:blogId}).exec();
   },
   deleteByCommentId(commentId){
     return CommentModel.deleteOne({_id:commentId}).exec();
   },
   updateCommentId(commentId,replys) {
     return CommentModel.updateOne({_id:commentId},{$set:{replys:replys}}).exec();
   },
   deleteAllComments(blogId){
     return CommentModel.deleteMany({blogId:blogId}).exec();
   },
}


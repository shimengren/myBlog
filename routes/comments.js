var express = require("express");
var router = express.Router();
var checkLogin = require('../middlewares/check').checkLogin;
var CommentsModel = require("./../models/comment");


router.post("/create",function(req,res,next){
    const blogId = req.fields.blogId;
    const comment = req.fields.comment;
    const author = req.session.user._id;
    try{
        if(!comment){
            throw new Error("留言不能为空")
        }
    } catch(err){
        req.flash("error", err.message);
        return res.redirect("back");
    }
    CommentsModel.createComment({blogId,comment,author}).then(function(result){
        console.log('留言不能为空',blogId,comment);
        req.flash("success",'留言创建成功');
        return res.redirect("back");
    }).catch(function(err){
        req.flash("error",err.message);
        return res.redirect("back");
    });
});
router.get("/:commentId/delete",function(req,res,next){
    const commentId = req.params && req.params.commentId;
    const topCommentId = req.query && req.query.topCommentId;
    CommentsModel.findCommentById(topCommentId || commentId).then(comment =>{
        try{
            if(!comment){
                throw new Error("该留言不存在")
            }
            if(req.session.user._id.toString() !== comment.author.toString()){
                throw new Error("你没有权限进行该操作");
            }
        } catch(err){
            req.flash("error",err.message);
            res.redirect("back");
        }
        if(topCommentId){ // 删除二级评论
            var newReplys = comment.replys.filter(function(item){
                return item._id != commentId;
            });
            Promise.all([CommentsModel.deleteByCommentId(commentId),CommentsModel.updateCommentId(topCommentId,newReplys)]).then(result => {
                req.flash("success","删除留言成功");
                res.redirect("back");
            })
        } else { // 删除顶层评论
            const arr = comment.replys && comment.replys.length > 0 ? comment.replys.map(function(item){return CommentsModel.deleteByCommentId(item._id)}) : [];
            arr.push(CommentsModel.deleteByCommentId(commentId));
              Promise.all(arr).then(result => {
                req.flash("success","删除留言成功");
                res.redirect("back");
               }) 
            }
    })
});
router.post("/:commentId/reply",function(req,res,next){
    const blogId = req.fields.blogId;
    const comment = req.fields.comment;
    const author = req.session.user._id;
    const commentId = req.params && req.params.commentId; //评论的上一级评论id
    const topPerson = req.fields.topPerson;
    const isSecondMark = true;
    try {
        if(!comment) {
            throw new Error("留言不能为空");
        }
    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
    }
    CommentsModel.createComment({blogId,author,comment,isSecondMark,topPerson},).then(data => {
        CommentsModel.findCommentById(commentId).then(result =>{
            const replys = result.replys || [];
            replys.unshift(data.ops[0]);
            CommentsModel.updateCommentId(commentId,replys).then(() =>{
                req.flash("success", '创建留言成功');
                res.redirect("back");
            })
        })
    }).catch(err => {
        req.flash("error", err.message);
        res.redirect("back");
    })
});
module.exports = router;

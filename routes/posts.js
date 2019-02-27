var express = require("express");
var router = express.Router();
var path = require("path");
var checkLogin  = require("../middlewares/check").checkLogin;
var PostsModel = require("./../models/posts");
var CommentsModel = require("./../models/comment");
var utils = require("./../public/util");
var url = require('url');
var querystring = require('querystring');

router.get("/create",checkLogin,function(req,res,next){
    PostsModel.getCategoryType().then(data => {
      const categoryTypes = data[0].categoryType;
      res.render("create",{categoryTypes:categoryTypes});
    })
})
router.post("/create",checkLogin,function(req,res,next){
    var title= req.fields.title;
    var content = req.fields.content;
    var categoryType = req.fields.categoryType;
    var passage ={
        title:title,
        content:content,
        author:req.session.user._id,
        categoryType:categoryType,
    }
    try{
       if(!title || !content){
           throw new Error("标题和内容不能为空");
       }
    } catch(err){
       req.flash("error",err.message);
       return res.redirect("back");
    }
    PostsModel.createPassage(passage).then(function(result){
       req.flash("success",'创建文章成功');
       return res.redirect("/posts/list");
    }).catch(function(err){
        console.log('errrrrr',err);
       req.flash("error",err.message);
       return res.redirect("back");
    })
});
router.get("/list", function(req,res,next){
    const urlObj = url.parse(req.url);
    const queryObj = querystring.parse(urlObj.query);
    const categoryType = queryObj.type || '1001';
    const arr = [PostsModel.getCategoryType(),PostsModel.findPassagesByCondition({pageSize:queryObj.pageSize || 10, pageNum: queryObj.pageNum || 1, categoryType:categoryType })]
    Promise.all(arr).then(function(result){
        var categoryTypes = result[0][0].categoryType;
        var passageList = result[1];
        if(passageList && passageList.length > 0){
            passageList.forEach(item => {
             item.author.avatar = item.author.avatar ? item.author.avatar.split(path.sep).pop(): 'detail-avatar.png';
             item.timeTag  = item.create_at ? utils.timesFun(item.create_at) : '';
            });
        }
        if(queryObj.pageSize && queryObj.pageNum){
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            res.send(passageList);
        } else {
            res.render("passageList",{passageList:passageList,categoryTypes:categoryTypes,currentCategoryType:categoryType});
        }
    });
});
// router.get('/posts/increacePv',function(req,res){
//   const postId = req.query && req.query.blogId;
//   console.log('postIdpostId',postId);
//   PostsModel.increasePv(postId).then(function(){
//     }).catch(function(err){
//         req.flash("error",err.message);
//         return res.redirect("back");
//   })
// })
router.get("/:postId",checkLogin,function(req,res){
    const postId = req.params && req.params.postId;
    const fromPage = req.query && req.query.from;
    let arr = [PostsModel.findPassageById(postId),CommentsModel.findAllComments(postId)];
    if(fromPage){
      arr.push(PostsModel.increasePv(postId));
    }
    Promise.all(arr).then(data =>{
        let  blogDetail = data[0];
        let comments = data[1] ? data[1].filter(function(item){return !item.isSecondMark}):[]; // 过滤
        let hasSubComments = data[1].some(function(item){return item.replys && item.replys.length >0 }); // 是否有子评论
        let arr = [];
        if(comments && comments.length > 0 && hasSubComments){
            new Promise(function(resolve){
                comments.forEach(function(item,index){
                  item.author.avatar = item.author.avatar ? item.author.avatar.split(path.sep).pop(): 'detail-avatar.png';
                  if(item.replys && item.replys.length > 0){
                    item.replys.forEach(function(item){
                        arr.push(item);
                    });
                  }
                })
                Promise.all(arr.map(function(item){return CommentsModel.findCommentById(item._id)})).then(result =>{
                    result.forEach(function(subItem,index){
                      arr[index] = subItem;
                    });
                    console.log('commentscomments5555',comments[0].replys);
                    comments.forEach(function(item){
                        if(item.replys && item.replys.length > 0){
                            item.replys = item.replys.map(function(subItem){
                                const index = arr.findIndex(function(subsItems){
                                    return String(subsItems._id) == String(subItem._id);
                                });
                                if(index >= 0){
                                    console.log('arr[index],',arr[index]);
                                    return arr[index];
                                } else {
                                    return subItem;
                                }
                                // if (arr.findIndex(function())
                                // arr.forEach(function(children) {
                                //     // console.log('childrenchildren',children._id, String(children._id) == String(subItem._id),subItem,children);
                                //   if(String(subItem._id) == String(children._id)){
                                
                                //     subItem = children;
                                //     console.log('zzzz',subItem);
                                //   }
                                // })
                            })
                            
                        }
                    })
                    console.log('commmentscommments',comments[0].replys);
                    resolve(comments);
                })
              }).then(obj =>{
                  res.render("passageDetail",{blogDetail,comments:obj});
              }).catch(err =>{
                  console.log('err', err)
              })
        } else {
            res.render("passageDetail",{blogDetail,comments:comments});
        }
    }).catch(err =>{
        console.log('err',err);
    }) 
});
router.get("/:postId/edit",checkLogin,function(req,res,next){
    const postId = req.params && req.params.postId;
    const author = req.session.user._id;
    Promise.all([PostsModel.getRawByPostId(postId),PostsModel.getCategoryType()]).then(function(result){
        const blogEdit = result[0];
        const categoryTypes = result[1][0].categoryType;
        console.log("categoryTypes", categoryTypes);
        if(!blogEdit){
            throw new Error("该文章不存在");
        }
        if(author.toString() !== blogEdit.author._id.toString()){
            throw new Error('权限不足');
        }
        res.render('passageEdit',{
            blogEdit:blogEdit,
            categoryTypes:categoryTypes
        })
    })
});
router.post("/:postId/edit",checkLogin,function(req,res,next){
    const postId = req.params && req.params.postId;
    var title= req.fields.title;
    var content = req.fields.content;
    var categoryType = req.fields.categoryType;
    var passage ={
        title:title,
        content:content,
        author:req.session.user._id,
        categoryType:categoryType,
    }
    try{
       if(!title || !content){
           throw new Error("标题和内容不能为空");
       }
    } catch(err){
       req.flash("error",err.message);
       return res.redirect("back");
    }
    PostsModel.updatePostById(postId,passage).then(function(result){
        req.flash("success",'编辑文章成功');
        return res.redirect("/posts/list");
    }).catch(function(err){
        req.flash("error",err.message);
        return res.redirect("back");
    })
});
router.get("/:postId/delete",checkLogin,function(req,res,next){
    const postId = req.params && req.params.postId;
    const author = req.session.user._id;
    PostsModel.getRawByPostId(postId).then(function(passage){
        try{
            if(!passage){
                throw new Error("该文章不存在");
            }
            if(author.toString() !== passage.author._id.toString()){
                throw new Error('权限不足');
            }
        } catch(err){
            req.flash("error",err.message);
           return res.redirect("back");
        }
        PostsModel.delPostById(postId).then(function(result){
            CommentsModel.deleteAllComments(postId).then(() =>{
                req.flash('success','删除文章成功');
                return res.redirect("/posts/list");
            }).catch(err =>{
                req.flash("error",err.message);
                return res.redirect('back');
            })
        }).catch(function(err){
            req.flash("error",err.message);
            return res.redirect('back');
        })
    }).catch(function(err){
        req.flash("error",err.message);
        return res.redirect('back');
    })
})

module.exports = router;
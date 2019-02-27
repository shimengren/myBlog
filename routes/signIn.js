var express = require("express");
var router = express.Router();
var checkNotLogin = require("../middlewares/check").checkNotLogin;
const UserModel = require("./../models/user");
const path = require("path");
const sha1 = require("sha1");

router.get("/",checkNotLogin,function(req,res,next){
    res.render("signin");
});
router.post("/",checkNotLogin,function(req,res,next){
    var name = req.fields.name;
    var password = req.fields.password;
    try{
        if(name.length == 0 || password.length == 0){
             throw new Error("账户和密码不为空")
        }
    } catch(err){
        req.flash("error",err);
        return res.redirect('/signin')
    }
    UserModel.findUserByName(name).then(function(user){
        if(!user){
            req.flash("error","暂无相关用户");
            return res.redirect("back");
        }
        const userAvatarPath = user.avatar ? user.avatar.split(path.sep).pop():"";
        // 根据用户名从数据库找到的对应用户
        if(user.password !== sha1(password)){
           req.flash("error","账号和密码不一致");
           return res.redirect("back");
        }
        req.session.user = {
            ...user,
            avatar:userAvatarPath
        };
        res.redirect("/posts/list");
    }).catch(function(err){
        req.flash("error",err.message);
        res.redirect("back");
        next(err)
    })
})

module.exports = router;
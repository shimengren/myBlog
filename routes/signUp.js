const express = require("express");
const router = express.Router();
const fs = require("fs");
const sha1 = require("sha1");
const UserModel = require("./../models/user");
const path = require("path");
var checkNotLogin = require("../middlewares/check").checkNotLogin;

router.get("/",checkNotLogin,function(req,res,next){
    res.render("signup");
});

router.post("/",checkNotLogin,function(req,res,next){
    var name = req.fields.name;
    var password =req.fields.password;
    var repassword = req.fields.repassword;
    var gender = req.fields.gender;
    var bio = req.fields.bio;
    var avatar = req.files.avatar.path.split(path.sep).pop();
    console.log('req.fields',req.fields);
    try{
        if(name.length <=1 || name.length >=10){
            throw new Error("账号必须限制在1-10个字符内");
        }
        if(!password || !repassword || password.length < 6 || repassword.length < 6){
            throw new Error("密码长度需要大于等于6，且密码和确认密码必须一致");
        }
        if(!req.files.avatar.name){
            throw new Error("请上传你的头像");
        }
        if(['m','f','x'].indexOf(gender) < 0){
            throw new Error("性别必须为男，女或者保密三者之一");
        }
     } catch(err){
         fs.unlinkSync(req.files.avatar.path);
         req.flash('error',err.message);
         return res.redirect('/signup');
     }
     password = sha1(password);
     let user ={
         name:name,
         password:password,
         gender:gender,
         bio:bio,
         avatar:avatar
     }
     UserModel.create(user).then(result =>{
         const user = result.ops[0];
         req.session.user = user;
         delete user.password;
         req.flash("success",'注册成功');
         res.redirect("/");
     }).catch(err =>{
         fs.unlinkSync(req.files.avatar.path);
        if(err.message.match("duplicate key")){
            req.flash("error",'用户名重复');
            return res.redirect("/signup");
        }
        next(err)
     })
});

module.exports = router;

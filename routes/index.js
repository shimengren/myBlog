// 定义路由拆分
module.exports = function(app){
    app.get("/",function(req,res,next){
        res.redirect("/posts/list");
    });
    app.use("/posts",require('./posts'));
    app.use("/signin",require("./signIn"));
    app.use("/signout",require("./signOut"));
    app.use("/signup",require("./signUp"));
    app.use("/comments",require("./comments"));
    app.use(function(req,res){
      if(!res.headerSent){
          res.render('404');
      }
    });
}


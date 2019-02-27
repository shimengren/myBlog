const winston = require("winston");
const expressWinston = require("express-winston");
const path = require("path");
const express = require("express");
const app = express();
const session = require("express-session");
const mongStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const config = require("config-lite")(__dirname);
const routes = require("./routes");
const formidableMiddleware = require("express-formidable");


app.set("views",path.join(__dirname,"views"));
app.set("view engine",'ejs');
app.use(express.static(path.join(__dirname,'public')));

app.use(session({
      name:config.session.name,
      key:config.session.key,
      secret:config.session.secret,
      resave:true,
      saveUninitialized:true,
      cookie:{
          maxAge:config.session.maxAge
      },
      store:new mongStore({
          url:config.mongodb
      })

}));

app.use(flash());
app.use(formidableMiddleware({
     uploadDir:path.join(__dirname,'public/image'),
     keepExtensions:true
}));

app.locals.blog ={
    // title:'我的博客系统',
    // description:'this is my first blog'
},
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash("error").toString();
    next();
})
app.use(expressWinston.logger({
    transports: [new (winston.transports.Console)({
        json:true,
        colorize:true
    }),
    new winston.transports.File({
      filename:'logs/success.log'
    })]
}));
routes(app);

app.use(expressWinston.errorLogger({
    transports: [
        new (winston.transports.Console)({
         json:true,
         colorize:true
        }),
        new winston.transports.File({
         filename:'logs/error.log'
        })
    ],
}));

if(module.parent){
   module.exports = app;
} else {
  app.listen(config.port,function(){
     console.log(`server is listening on the port ${config.port}`);
  });
}
process.on("",function(err){
    console.log('err',err);
})



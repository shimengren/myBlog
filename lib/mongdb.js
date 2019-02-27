const config = require("config-lite")(__dirname);
const Mongolass = require('mongolass');
const mongolass = new Mongolass();
const moment = require("moment");
const objectIdToTimeStamp = require("objectid-to-timestamp");
const mark = require("marked");
mongolass.connect(config.mongodb);

// 根据id生成创建时间create_at
mongolass.plugin("addCreatedAt",{
   afterFind:function(results){
       results.forEach(function(item){
           item.create_at = moment(objectIdToTimeStamp(item._id)).format('YYYY-MM-DD HH:mm:ss');
       });
       return results;
   },
   afterFindOne:function(result){
       if(result){
           result.create_at = moment(objectIdToTimeStamp(result._id)).format('YYYY-MM-DD HH:mm:ss');
       }
       return result;
   }
});

exports.User = mongolass.model("User",{
     name:{type:'string',require:true},
     password:{type:'string',require:true},
     avatar:{type:'string',require:true},
     gender:{type:'string',enum: ['m', 'f', 'x'], default: 'x'},
     bio:{type:'string',require:true},
});
exports.User.index({name:1},{unique:true}).exec();

exports.Posts = mongolass.model("Posts",{
    author:{type:Mongolass.Types.ObjectId,required:true},
    title:{type:"string",required:true},
    content:{type:"string",required:true},
    pv:{type:"number",default:0},
    categoryType:{type:'string',require:true}, // 文章类型
})
exports.Posts.index({author:1,_id:-1}).exec();

exports.Comment = mongolass.model("Comments", {
  author:{type:Mongolass.Types.ObjectId, required:true},
  comment:{type:"string", required:true},
  blogId:{type:Mongolass.Types.ObjectId, required: true},
  isSecondMark:{type:Mongolass.Types.Boolean,default:false}, // 是否是二级评论
  topPerson:{type:'string'}, // 子评论的被评论人，比如b评论a那么存储a的用户名用于展示
  replys:[{type:Mongolass.Types.Mixed}], // 二级评论相关的信息
});
exports.Comment.index({postId:1,id:-1}).exec();

exports.Dictionaries = mongolass.model('Dictionary',{
    caterogyType:{type:Mongolass.Types.Mixed},
});
exports.Dictionaries.index({id:-1}).exec();








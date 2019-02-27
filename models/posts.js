const Posts = require("../lib/mongdb").Posts;
const Dictionaries = require("../lib/mongdb").Dictionaries;
console.log('DictionaryDictry',Dictionaries.findOne().exec().then(data =>{console.log('dtataataa',data)}));
const Comments = require("./comment");
const marked = require("marked");

// 将post提交的内容从markdown转换成html
Posts.plugin("contentToHtml",{
    afterFindOne:function(posts){
        if(posts){
            return posts.content ? {...posts,content:marked(posts.content)}:posts;
        }
    },
    afterFind:function(posts){
        return posts.map(function(post){
           return post.content ? {...post,content:marked(post.content)}: post;
        })
    }
});
//计算每篇文章下的留言数量
Posts.plugin('commentsCount',{
   afterFindOne:function(posts){
    if(posts){
        return Comments.commentNum(posts._id).then(function(count){
            posts.commentNum = count;
            return posts;
        })
    }
   },
   afterFind:function(posts){
       return Promise.all(posts.map(function(post,index){
           return Comments.commentNum(post._id)
       })).then(function(result){
         result.forEach(function(subItem,index){
            posts[index].commentNum = subItem;
         });
         return posts;
       });
   }
});
module.exports = {
    createPassage:function(passage){
        console.log('passagepassage',passage);
        return Posts.create(passage).exec();
    },
    findPassageById(passage_id){
        return Posts.findOne({_id:passage_id}).populate({ path: 'author', model: 'User' }).commentsCount().contentToHtml().addCreatedAt().exec();
    },
    findPassagesByCondition(params){
        const pageSize = params.pageSize;
        const pageNum = params.pageNum;
        const categoryType = params.categoryType;
        return Posts.find({categoryType:categoryType}).skip(pageSize*(pageNum - 1)).limit(Number(pageSize)).populate({ path: 'author', model: 'User' }).sort({_id:-1}).commentsCount().contentToHtml().addCreatedAt().exec();
    },
    increasePv(_id){ // 统计用户浏览某篇文章的次数
       return Posts.update({_id:_id},{$inc:{pv:1}}).exec();
    },
    getRawByPostId(_id){ //populate表与表之间的关联操作
        return Posts.findOne({_id:_id}).populate({ path: 'author', model: 'User' }).exec();
    },
    updatePostById(_id,data){
        return Posts.update({_id:_id},{$set:data}).exec();
    },
    delPostById(_id){
        return Posts.deleteOne({_id}).exec();
    },
    getCategoryType(){
        return Dictionaries.find().exec();
    }
}


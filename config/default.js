module.exports = {
    port:3001,
    session:{
        secret:"myBlog",
        key:"myBlog",
        maxAge:2569200,
    },
    mongodb:'mongodb://myBlog:123456@localhost:27017/myBlog',  
}
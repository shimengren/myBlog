const User = require("./../lib/mongdb").User;

module.exports = {
    create:function create(user){
        return User.create(user).exec();
    },
    findUserByName:function findUserByName(name){
        return User.findOne({
            name:name
        }).addCreatedAt().exec();
    },
    findUserById(id) {
      return User.findOne({_id:id}).exec();
    },
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const config = require('../config');

const User = new Schema({
    username: String,
    password: String,
    admin: {type: Boolean, default: false}
})

//유저 생성
User.statics.create = function(username, password){
    //패스워드 암호화
    const encrypted = crypto.createHmac('sha1', config.secret)
                            .update(password)
                            .digest('base64');

    const user = new this({
        username,
        password: encrypted
    });

    return user.save();
};

//유저 찾기
User.statics.findOneByUsername = function(username){
    return this.findOne({
        username
    }).exec()
};

//비밀번호 검증
User.methods.verify = function(password){
    const encrypted = crypto.createHmac('sha1', config.secret)
                            .update(password)
                            .digest('base64');
    return this.password === encrypted;
};

//관리자 계정으로 설정.
User.methods.assignAdmin = function(){
    this.admin =true;
    return this.save();
}

module.exports = mongoose.model('User', User);
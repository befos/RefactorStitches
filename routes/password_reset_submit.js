var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var createhash = require('../public/js/Kfolder/createhash.js').createhash;

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

var STRETCH = 10000; //パスワードをストレッチする際の回数


router.post('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
});
    req.session.error_status = 0;
    //formから飛ばされた情報を受け取って変数に格納
    var password = req.body.password; //上と同じ
    var salt = randword.method(10);
    var passhash = createhash.method(password, salt, STRETCH);
    var uid = req.session.one_shot_id;
    var string = '変更';
    User.find({uid:uid},function(err,result){
        if(err) return hadDbError(err, req, res);
        if(result){
            if (result.length === 0) {
                //console.log("nosuch"); //見つからなかった場合の処理(時間外)
                return hadUrlError(req, res);
            }else{
                if(result[0].ac_reset !== true){
                    //不正なアクセス（リセットフラグが立ってないのにアクセス）
                    return hadUrlError(req, res);
                }
                if(result[0].ac_st === false){
                    //もし認証が済んでいなかったらついでに認証も済ませる
                    string ='認証及び変更';
                }
                User.update({uid:uid},{$set:{hashpass:passhash,　ac_reset:false,　salt:salt, ac_st:true}},function(err){
                    if(err) return hadDbError(err, req, res);
                    if(!err){
                        req.session.one_shot_id = null;
                        req.session.error_status = 0;
                        req.session.pw = true;
                        res.render('password_reset_submit', {string:string});
                        mongoose.disconnect();
                    }
                });
            }
        }
    });
});

//エラーハンドル
function hadUrlError(req ,res){
    req.session.error_status = 5;
    res.redirect('/password_reset');
    mongoose.disconnect();
}

function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/password_reset');
    mongoose.disconnect();
}

module.exports = router;

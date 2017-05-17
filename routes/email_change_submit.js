var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var createhash = require('../public/js/Kfolder/createhash.js').createhash;

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;


router.post('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
});
    req.session.error_status = 0;
    //formから飛ばされた情報を受け取って変数に格納
    var email = req.body.email;
    var obj_id = req.session.obj_id;
    User.find({_id:obj_id},function(err,result){
        if(err) return hadDbError(err, req, res);
        if(result){
            if (result.length === 0) {
                //console.log("nosuch"); //見つからなかった場合の処理(時間外)
                return hadUrlError(req, res);
            }else{
                if(result[0].ac_ec !== true){
                    //不正なアクセス（ecフラグが立ってないのにアクセス）
                    return hadUrlError(req, res);
                }
                User.update({_id:obj_id},{$set:{ac_ec:false,　email:email}},function(err){
                    if(err) return hadDbError(err, req, res);
                    if(!err){
                        req.session.destroy();
                        req.session.em = true;
                        res.render('email_change_submit');
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
    res.redirect('/email_change');
    mongoose.disconnect();
}

function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/email_change');
    mongoose.disconnect();
}

function hadSessionseqError(res, req) {
    //console.log(err);
    req.session.error_status = 8;
    res.redirect('/email_change');
    mongoose.disconnect();
}

module.exports = router;

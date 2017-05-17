var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var createhash = require('../public/js/Kfolder/createhash.js').createhash;
var sha256 = require('js-sha256');
var url = require('url');
require('date-utils');
var moment = require('moment');

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

var STRETCH = 10000; //パスワードをストレッチする際の回数

router.get('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
});
    var u = url.parse(req.url, false);
    var dt = new Date();
    var today = moment();
    var confirmtime = today;
    //console.log(u.query);
    User.find({url_pass2:u.query}, function(err, result) {
        if(err) return hadDbError(err, req, res);
        if (result) {
            if (result.length === 0) {//同じ_idが無い場合はDB上にデータが見つからないので0
                //console.log("nosuch"); //見つからなかった場合の処理(時間外)
                return hadUrlError(req, res);
            } else {//見つかった
                var expiretime = result[0].regest.toFormat("YYYY/MM/DD HH24:MI:SS");
                var reset = result[0].ac_reset;
                if(reset === false){
                  //console.log('WTF!');
                  return hadUrlError(req, res);
                }
                if(expiretime <= confirmtime){
                    //console.log('URL error');
                    return hadUrlError(req, res);
                }
                req.session.one_shot_id = result[0].uid;
                req.session.error_status = 0;
                res.render('password_reset_regene',{reqCsrf:req.csrfToken()});
                mongoose.disconnect();
            }
        }
    });
});

//エラーハンドラー
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

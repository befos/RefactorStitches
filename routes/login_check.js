var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var createhash = require('../public/js/Kfolder/createhash.js').createhash;


//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

var STRETCH = 10000; //パスワードをストレッチする際の回数

var insert = require('../config/template.json');//テンプレートの読み込み
var conf = require('../config/commonconf.json');

router.post('/', function(req, res, next) {
            if (req.body.id !== null && req.body.password !== null) {
                mongoose.connect('mongodb://localhost:27017/userdata', function(){
                    //console.log('connected');
                });//コネクションが確立されていれば新規に立てない
                var id = req.body.id; // login.ejsのformから飛ばされた情報を受け取って変数に格納
                var password = req.body.password; //上と同じ
                User.find({email: id}, function(err, result) {
                    if (err) return hadDbError(err, req, res);
                    if (result) {
                        if (result.length === 0) { //同じ_idが無い場合はDB上にデータが見つからないので0
                            //console.log("nosuch"); //見つからなかった場合の処理（認証フェーズへ）
                            User.find({
                                uid: id
                            }, function(err, result) {
                                if (err) return hadDbError(err, req, res);
                                if (result) {
                                    if (result.length === 0) { //同じuidが無い場合はDB上にデータが見つからないので0
                                        req.session.error_status = 1;
                                        res.redirect('/login');
                                        mongoose.disconnect();
                                    } else {//uidが見つかった
                                        //console.log("such uid");
                                        var dbpass = result[0].hashpass;
                                        var salt = result[0].salt;
                                        var account_status = result[0].ac_st;
                                        var passhash = createhash.method(password, salt, STRETCH);
                                        if (account_status === false) { //本登録が済んでいなかったらリダイレクト
                                            return hadLoginError(req, res);
                                        }
                                        if (dbpass === passhash) {//認証フェーズ
                                            User.update({
                                                uid: id
                                            }, {
                                                $set: {
                                                    ac_use: true
                                                }
                                            }, function(err) {
                                                if (err) return hadDbError(err, req, res);
                                                if (!err) {
                                                    req.session.regenerate(function(err) {
                                                        if (err) return hadSessionError(err, req, res);
                                                        if (!err) {
                                                            req.session.error_status = 0;
                                                            req.session.obj_id = result[0]._id;
                                                            req.session.user_id = id;
                                                            req.session.user_email = result[0].email;
                                                            req.session.user_name = result[0].name;
                                                            res.redirect('/mypage');
                                                            mongoose.disconnect();
                                                        }
                                                    });
                                                }
                                            });
                                        } else {//IDは見つかったがパスワードが一致しない
                                            return hadInputdataError(req, res);
                                        }
                                    }
                                }
                            });
                        } else { //Emailaddressが見つかった
                            //console.log("such Emailaddress");
                            var dbpass = result[0].hashpass;
                            var salt = result[0].salt;
                            var account_status = result[0].ac_st;
                            var passhash = createhash.method(password, salt, STRETCH);
                            if (account_status === false) { //本登録が済んでいなかったらリダイレクト
                                return hadLoginError(req, res);
                            }
                            //認証フェーズ
                            if (dbpass === passhash && account_status === true) {
                                User.update({
                                    email: id
                                }, {
                                    $set: {
                                        ac_use: true
                                    }
                                }, function(err) {
                                    if (err) return hadDbError(err, req, res);
                                    if (!err) {
                                        req.session.regenerate(function(err) { //セッションフィクセーション対策(セッションIDの再発行)
                                            if (err) return hadSessionError(err, req, res);
                                            if (!err) {
                                                req.session.error_status = 0;
                                                req.session.obj_id = result[0]._id;
                                                req.session.user_id = id;
                                                req.session.user_email = result[0].email;
                                                req.session.user_name = result[0].name;
                                                res.redirect('/mypage');
                                                mongoose.disconnect();
                                            }
                                        });

                                    }
                                });
                            } else {
                                //IDは見つかったがパスワードが一致しない
                                return hadInputdataError(req, res);
                            }
                        }
                    }
                });
            } else {
                return hadInputdataError(req, res);
            }
});

//エラーハンドル
function hadInputdataError(req, res) {
    req.session.error_status = 1;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadDbError(err, req, res) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadSessionError(err, req, res) {
    //console.log(err);
    req.session.error_status = 8;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadLoginError(req, res) {
    req.session.error_status = 9;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadRateoverError(err, req, res) {
    //req.session.error_status = 13;
    res.locals = insert.loginrateover;
    res.render('RedirectError');
    mongoose.disconnect();
}


module.exports = router;

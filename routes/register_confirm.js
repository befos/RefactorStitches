var express = require('express');
var router = express.Router();
var url = require('url');
require('date-utils');

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;


var insert = require('../config/template.json');

router.get('/', function(req, res, next) {
            mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
});
            var u = url.parse(req.url, false);
            var dt = new Date();
            var confirmtime = dt.toFormat("YYYY/MM/DD HH24:MI:SS");
            //console.log(u.query);
            var one_shot_query = u.query;
            User.find({
                url_pass: one_shot_query
            }, function(err, result) {
                if (err) return hadDbError(err, res);
                if (result) {
                    if (result.length === 0) { //同じ_idが無い場合はDB上にデータが見つからないので0
                        //console.log("nosuch url_pass"); //見つからなかった場合の処理(時間外)
                        return hadUrlError(req, res);
                    } else {
                        //見つかった
                        var email = result[0].email;
                        var status = result[0].ac_st;
                        var expiretime = result[0].regest;
                        if (status === true) {
                            //console.log('This account activeted');
                            return hadActivatedError(req, res);
                        }
                        if (expiretime <= dt) {
                            //console.log('URL error');
                            return hadUrlError(req, res);
                        }
                        User.update({
                            email: email
                        }, {
                            $set: {
                                ac_st: true
                            }
                        }, function(err) {
                            if (err) return hadDbError(err, req, res);
                            if (!err) {
                                //console.log("Acitvete account");
                                req.session.error_status = 0;
                                res.render('register_confirm');
                                mongoose.disconnect();
                            }
                        });
                    }
                }
            });
});

//エラーハンドラー
function hadActivatedError(req, res) {
    req.session.error_status = 3;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadUrlError(req, res) {
    req.session.error_status = 5;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadDbError(err, req, res) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadRateoverError(err, req, res) {
    //req.session.error_status = 13;
    res.locals = insert.registerrateover;
    res.render('RedirectError');
}
module.exports = router;

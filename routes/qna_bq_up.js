var express = require('express');
var router = express.Router();
var url = require('url');
var qstring =require("querystring");
var async = require("async");
var mailer = require('nodemailer');　
var template = require('../config/template.json');

/*データベースの接続設定*/
var mongoose = require('mongoose');
var models = require('../models/models.js');　
var Forum = models.Forum;
var User = models.Users;

var generator = require('xoauth2').createXOAuth2Generator({ //googleの認証用
    user: 'stichies01@gmail.com',
    clientId: '1096218509599-63cs90qmsvdg5v8to44cn3tgl4ni0c9o.apps.googleusercontent.com',
    clientSecret: 'XMkfmFGd2Iv1jBWNgvmjUxsf',
    refreshToken: '1/gSZzfoVBTjXr1IE-ah-n7mA3aLl3RulrQHItdoznRkw',
});

var conf = require('../config/commonconf.json');

router.get('/', function(req, res, next) {
    if(!req.session.user_id) return hadNotloginError(req ,res);

    var u = url.parse(req.url, false);
    var query = qstring.parse(u.query);
    var error = req.session.error_status;

    /*データベース接続*/
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
        //console.log("connected");
    });

    var userid;

    Forum.find({_id:query.mfo},{},{},function(err,result3){
        if(err) return hadDbError(err, req, res);
        if(result3.length === 0){
            return;
        }
        userid = result3[0].hostid;
    Forum.find({$and:[{bq:{$elemMatch:{$eq:query.myid}}},{_id:query.mfo}]},{}, {}, function(err, result) {
        if (err) return hadDbError(err, req, res);
        if (result) {
            if (result.length !== 0) { //同じ_idが無い場合はDB上にデータが見つからないので0
                //console.log("nosuch");
                return hadHighrateseqError(req, res);
            }else{
                    var insert = req.session.obj_id;
                    Forum.update({_id:query.mfo},{$push:{bq:insert}},function(err){
                        if(err) return hadDbError(req, res, err);
                        User.find({_id:userid},{},function(err, result1){
                            if(err) return hadDbError(err, req, res);
                            if(result1.length === 0){
                                return;
                            }
                                var email = result1[0].email;
                                var mailOptions = { //メールの送信内容
                                    from: 'stitches運営<stichies01@gmail.com>',
                                    to: email,
                                    subject: 'BQのご通知',
                                    html: 'あなたの質問に高評価がつけられました。<br>' +
                                        　'おめでとうございます！<br>' +
                                          conf.sendmailconf.url5 + query.mfo
                                };
                                var transporter = mailer.createTransport(({ //SMTPの接続
                                    service: 'gmail',
                                    auth: {
                                        xoauth2: generator
                                    }
                                }));
                                transporter.sendMail(mailOptions, function(err, resp) { //メールの送信
                                    if (err) { //送信に失敗したとき
                                        transporter.close();
                                        return hadSendmailError(err, req, res, resp);
                                    }
                                    if (!err) { //送信に成功したとき
                                        console.log('Message sent');
                                    }
                                    transporter.close(); //SMTPの切断
                                });
                            req.session.error_status = 0;
                            return hadHigirateSeq(req, res);
                            });
                    });
            }
        }
    });
});
});

function hadSendmailError(err, req, res, resp) {
    console.log(err);
    req.session.error_status = 4;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadUrlError(req ,res){
    req.session.error_status = 5;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadDbError(err, req, res) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadNotloginError(req, res) {
    req.session.error_status = 10;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadHigirateSeq(req, res){
    req.session.error_status = 18;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadHighrateseqError(req, res){
    req.session.error_status = 19;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

module.exports = router;

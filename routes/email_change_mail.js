var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var sha256 = require('js-sha256');
var mailer = require('nodemailer');　
var generator = require('xoauth2').createXOAuth2Generator({ //googleの認証用
    user: 'stichies01@gmail.com',
    clientId: '1096218509599-63cs90qmsvdg5v8to44cn3tgl4ni0c9o.apps.googleusercontent.com',
    clientSecret: 'XMkfmFGd2Iv1jBWNgvmjUxsf',
    refreshToken: '1/gSZzfoVBTjXr1IE-ah-n7mA3aLl3RulrQHItdoznRkw',
});

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

var insert = require('../config/template.json'); //テンプレートの読み込み
var conf = require('../config/commonconf.json');

var URL = conf.sendmailconf.url2; //メール認証用のURL
var MINUTES = conf.sendmailconf.minute; //数字でURLが有効な分数を指定


router.post('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function() {
        //console.log('connected');
    });
    var email = req.body.id;
    var obj_id = req.session.obj_id;
    var url_pass3 = sha256(randword.method(16));
    var mailOptions = { //メールの送信内容
        from: 'stitches運営<stichies01@gmail.com>',
        to: email,
        subject: 'メールアドレスの変更について',
        html: '以下のURLからメールアドレスの変更を行ってください。<br>' +
            'URLの有効時間は' + MINUTES + '分間です。<br>' +
            '有効時間後は再度メールアドレスの変更を行ってください。<br>' +
            URL + url_pass3 + '<br><br>'
    };
    User.find({
        _id: obj_id
    }, function(err, result) {
        if (err) return hadDbError(err, res, req);
        if (result) {
            if (result.length === 0) {
                return hadInputdataError(req, res);
            } else {
                if (result[0].email == email) { //変更後と変更前が同じ場合
                    return hadInputdataError(req, res);
                }
                var dt = new Date();
                dt.setMinutes(dt.getMinutes() + MINUTES);
                var ect = dt.toFormat("YYYY/MM/DD HH24:MI:SS"); //時間を取得
                //console.log(ect);
                User.update({
                    _id: obj_id
                }, {
                    $set: {
                        ac_ec: true,
                        url_pass3: url_pass3,
                        ect: ect,
                        cemail: email
                    }
                }, function(err) {
                    if (err) return hadDbError(err, res, req);
                    if (!err) {
                        //この下からメールを送信する処理
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
                                //console.log('Message sent');
                            }
                            transporter.close(); //SMTPの切断
                        });
                        req.session.error_status = 0;
                        res.render('email_change_mail');
                        mongoose.disconnect();
                    }
                });
            }
        }
    });
});

//エラーハンドル
function hadInputdataError(req, res) {
    req.session.error_status = 1;
    res.redirect('/email_change');
    mongoose.disconnect();
}

function hadOverlapError(req, res) {
    req.session.error_status = 2;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadSendmailError(err, req, res, resp) {
    //console.log(err);
    req.session.error_status = 4;
    res.redirect('/email_change');
    mongoose.disconnect();
}

function hadDbError(err, res, req) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/email_change');
    mongoose.disconnect();
}

function hadRateoverError(err, req, res) {
    //req.session.error_status = 13;
    res.locals = insert.emailchrateover;
    res.render('RedirectError');
    mongoose.disconnect();
}

module.exports = router;

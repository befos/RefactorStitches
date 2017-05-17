var express = require('express');
var router = express.Router();
var randword = require('../public/js/Kfolder/randword.js').randword;
var createhash = require('../public/js/Kfolder/createhash.js').createhash;
var sha256 = require('js-sha256');
var mailer = require('nodemailer');
require('date-utils');
var generator = require('xoauth2').createXOAuth2Generator({//googleの認証用
    user: 'stichies01@gmail.com',
    clientId: '1096218509599-63cs90qmsvdg5v8to44cn3tgl4ni0c9o.apps.googleusercontent.com',
    clientSecret: 'XMkfmFGd2Iv1jBWNgvmjUxsf',
    refreshToken: '1/gSZzfoVBTjXr1IE-ah-n7mA3aLl3RulrQHItdoznRkw',
});
var conf = require('../config/commonconf.json');

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

var STRETCH = 10000; //パスワードをストレッチする際の回数
var URL = conf.sendmailconf.url3;//メール認証用のURL
var MINUTES = conf.sendmailconf.minute;//数字でURLが有効な分数を指定

router.post('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
});
    req.session.error_status = 0;
    var id = req.body.id; //formから飛ばされた情報を受け取って変数に格納
    var password = req.body.password; //上と同じ
    var email = req.body.email;
    var user_name = req.body.user_name;
    var user_job = req.body.user_job;
    var user_language = req.body.user_language;
    var user_sex = req.body.user_sex;
    var year = req.body.year;
    if(req.body.edit == "edit"){
        password = "edit";
        if(!req.session.user_name) return hadNotloginError(req, res);
        User.update({_id:req.session.obj_id},{$set:{name:user_name,age:year,work:user_job,uf_pl:user_language}},function(err){
            if(err) return hadDbError(err, req, res);
            if(!err) return hadEdited(req, res);
        });
    }else{
    var salt = randword.method(10);
    var url_pass = sha256(randword.method(16));
    var passhash = createhash.method(password, salt, STRETCH);
    var mailOptions = { //メールの送信内容
        from: 'Stichies運営<stichies01@gmail.com>',
        to: email,
        subject: 'Stiches本登録について',
        html: '以下のURLからアカウトを有効にしてください。<br>' +
            'URLの有効時間は'+ MINUTES +'分間です。<br>' +
            '有効時間後はパスワードのリセットを行ってください。<br>' +
            URL + url_pass + '<br><br>'
    };
    User.find({email: email}, function(err, result) {
        if(err) return hadDbError(err, req, res);
            if (result) {
                if (result.length === 0) {//同じ_idが無い場合はDB上にデータが見つからないので0
                    //console.log("nosuch"); //見つからなかった場合の処理（新規作衛）
                    User.find({uid: id}, function(err, result) {
                        if (err) return hadDbError(err, req, res);
                        if (result) {
                            if (result.length === 0) {//同じuidが無い場合はDB上にデータが見つからないので0
                                var dt = new Date();
                                dt.setMinutes(dt.getMinutes() + MINUTES);
                                var regetime = dt.toFormat("YYYY/MM/DD HH24:MI:SS");//時間を取得
                                //console.log(regetime);
                                var onetimeuser = new User({
                                  email: email,
                                  uid: id,
                                  name: user_name,
                                  age: year,
                                  sex: user_sex,
                                  work: user_job,
                                  prop: "/img/profile/hituzi19.png",
                                  uf_pl: user_language,
                                  place: null,
                                  hashpass: passhash,
                                  salt: salt,
                                  url_pass: url_pass,
                                  url_pass2: null,
                                  url_pass3: null,
                                  regest: regetime,
                                  regentime: null,
                                  chpst: null,
                                  ac_st: false,
                                  ac_use: false,
                                  ac_reset: false,
                                  ac_ec: false,
                                  ac_gr: false,
                                  mypage_st: true,
                                });
                                onetimeuser.save(function(err) {
                                  if(err) return hadDbError(err , req, res);//バリデーションエラーが出る可能性(もし被りが出た場合)
                                  if(!err){
                                    //この下からメールを送信する処理
                                    var transporter = mailer.createTransport(({ //SMTPの接続
                                        service: 'gmail',
                                        auth: {
                                            xoauth2: generator
                                        }
                                    }));
                                    transporter.sendMail(mailOptions, function(err, resp) { //メールの送信
                                        if (err) { //送信に失敗したとき
                                            return hadSendmailError(err, req, res, resp);
                                        }
                                        if (!err) { //送信に成功したとき
                                            //console.log('Message sent');
                                        }
                                        transporter.close(); //SMTPの切断
                                    });
                                    req.session.error_status = 0;
                                    res.render('register_submit');
                                    mongoose.disconnect();
                                  }
                                });
                            } else {
                                //uidがかぶっているのでリダイレクト
                                //console.log("such uid");
                                hadOverlapError(req, res);
                            }
                        }
                    });
                } else {
                    //console.log("such email");
                    hadOverlapError(req, res);
                }
            }
    });
    }
});

//エラーハンドル
function hadOverlapError(req ,res){
    req.session.error_status = 2;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadSendmailError(err, req, res, resp){
    //console.log(err);
    req.session.error_status = 4;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/register');
    mongoose.disconnect();
}

function hadNotloginError(req, res) {
    req.session.error_status = 10;
    res.redirect('/login');
    mongoose.disconnect();
}

function hadEdited(req, res){
    req.session.error_status = 21;
    res.redirect('/mypage');
    mongoose.disconnect();
}

module.exports = router;

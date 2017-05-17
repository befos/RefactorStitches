var express = require('express');
var router = express.Router();
var async = require("async");

/*データベースの接続設定*/
var mongoose = require('mongoose');
var models = require('../models/models.js');　
var Forum = models.Forum;
var ForumCont = models.ForumCont;
var User = models.Users;

var template = require('../config/template.json');

router.get('/', function(req, res, next) {
    if (!req.session.user_id) return hadNotloginError(req, res);
    //データベース接続設定
    var db = mongoose.connection;
    db.on('open', function() {
    });
    db.on('close', function() {
    });
    db.open("mongodb://localhost:27017/userdata");

    Forum.find({_id:req.session.cp}, function(err, result){
        if(err) return hadDbError(err, req, res);
        if(result.length === 0) return hadDbError(err, req, res);
            var forum1 ={
                _id:result[0]._id,
                hostid:result[0].hostid,
                tag:result[0].tag,
                host:"",
                title:result[0].foname,
                uday:result[0].uday.toFormat("YYYY/MM/DD HH24:MI:SS"),
                ques:result[0].ques,
                balink:"question_board_ba?" + req.session.cp,
                baid:result[0].baid,
                f_st:result[0].f_st
            };
            User.find({_id:forum1.hostid},{},function(err, result3){
                if(err) return hadDbError(err, req, res);
                if(result3.length === 0){
                    forum1.host ="このユーザは存在しません。";
                }else{
                    forum1.host = result3[0].name;
                }
                //console.log(obj_id);
                ForumCont.find({$and:[{mfo:req.session.cp},{answer:req.session.obj_id}]},{},{sort:{cuday: -1}},function(err, result2){
                    if(err) return hadDbError(err, req, res);
                    var data = {
                        "AnswerID":[],
                        "Conid":[],
                        "Answer":[],
                        "Cuday":[],
                        "Cont":[],
                        "mfo":req.session.cp,
                        "myid":req.session.obj_id,
                        "hostid":forum1.hostid,
                        "tag":forum1.ta
                    };
                    for(var i = 0 ; i < result2.length ; i++){
                        data.AnswerID.push(result2[i].answer);
                        data.Conid.push(result2[i]._conid);
                        data.Cuday.push(result2[i].cuday.toFormat("YYYY/MM/DD HH24:MI:SS"));
                        data.Cont.push(result2[i].text);
                    }
                    //console.log(data);
                    var list = [//ユーザーIDの保存領域
                    ];

                    for(i = 0 ; i < data.AnswerID.length ; i++){
                        list.push({id:data.AnswerID[i]});
                    }
                    //console.log(list);
                    async.eachSeries(list, function(data2, next) {//ユーザーIDをキーにして動的にWebページの投稿者名を変更する
                        setTimeout(function() {
                            User.find({_id:data2.id},{},function(err, result3){
                                if(err) return hadDbError(err, req, res);
                                if(result3.length === 0){
                                    data.Answer.push("このユーザは存在しません。");
                                    return next();
                                }
                                data.Answer.push(result3[0].name);
                                next();
                            });
                        }, 0);
                    }, function(err) {
                    res.locals = template.common.true; //varからここまででテンプレートに代入する値を入れている
                    res.render('qna_eq', {
                        userName: req.session.user_name,
                        reqCsrf: req.csrfToken(),
                        fo:forum1,
                        foid:req.session.cp,
                        data:data
                    });
                    mongoose.disconnect();
                });
            });
        });
    });
});

router.post('/', function(req, res, next) {
    if (!req.session.user_id) return hadNotloginError(req, res);

    //データベース接続設定
    var db = mongoose.connection;
    db.on('open', function() {
    });
    db.on('close', function() {
    });
    db.open("mongodb://localhost:27017/userdata");

    var hantei = req.body.if;
    var quesid = req.body.quesid;
    var ansid = req.body.ba;
    var user = req.body.abaid;
    var mfo = req.body.mfo;

    if(hantei == "ques"){
        Forum.find({_id:quesid}, function(err, result){
            if(err) return hadDbError(err, req, res);
            if(result.length === 0) return hadDbError(err, req, res);
                var insert = result[0].ques;
                res.locals = template.common.true; //varからここまででテンプレートに代入する値を入れている
                res.render('qna_einput', {
                    userName: req.session.user_name,
                    reqCsrf: req.csrfToken(),
                    ins: insert,
                    data:"edit"
                });
                mongoose.disconnect();
        });
    }else{
        req.session.oneshot_conid = ansid;
        ForumCont.find({$and:[{mfo:req.session.cp},{answer:req.session.obj_id}]},{},{sort:{cuday: -1}},function(err, result2){
            if(err) return hadDbError(err, req, res);
                var insert = result2[0].text;
                res.locals = template.common.true; //varからここまででテンプレートに代入する値を入れている
                res.render('qna_ecinput', {
                    userName: req.session.user_name,
                    reqCsrf: req.csrfToken(),
                    ins: insert,
                    data:"edit"
                });
                mongoose.disconnect();
        });
    }
});

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

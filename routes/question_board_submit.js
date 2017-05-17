var express = require('express');
var router = express.Router();
require('date-utils');//現在時刻の取得

//データベース接続および設定　
var mongoose = require('mongoose');
var models = require('../models/models.js');　
var Forum = models.Forum;
var ForumCont = models.ForumCont;

router.post('/', function(req, res, next) {
    var foname =　req.body.title;
    var host = req.body.host;
    var hostid = req.body.hostid;
    var question = req.body.cont;
    var tag = req.session.tag;
    var difselect = req.body.difselect;
    var status = req.body.edit;
    var dt = new Date();
    var uday = dt.toFormat("YYYY/MM/DD HH24:MI:SS");
    if(!req.session.checksubmit){
        req.session.checksubmit = "no";
    }
    var checksub = req.session.checksubmit;
    if(checksub == "ok"){
        req.session.checksubmit = "no";
        return hadUpload(req, res);
    }
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
        //console.log('connected');
    });
    if(status !=  "edit"){//エディット状態か見極める
        var makeforum = new Forum({
            foname: foname,//フォーラムの名前（被りあり）
            host: host,
            diff: difselect,//難易度
            hostid: hostid,//obj_id
            count: null,//アクセスされた回数
            baid: null,//BAのIDを保存
            abaid: null, //BAになった回答者のIDを保存
            uday: uday,
            ques: question,
            bq:[],
            tag: tag,//この中に言語も記述してもらう(ニコ動のタグみたいなもの)
            f_st: true//forumの内容が解決済み...false　初期値はtrue
        });
        makeforum.save(function(err) {//refを使用しているので二重にセーブ
          if(err) return hadDbError(err , req, res);//バリデーションエラーが出る可能性(もし被りが出た場合)
          var conid = mongoose.Types.ObjectId();
          var makefocont = new ForumCont({
              _id: makeforum._id,
              _conid : conid//回答を保存する回答ページでつける
          });
          makefocont.save(function(err){
             if(err) return hadDbError(err, req, res);
             if(!err){
                 req.session.checksubmit = "ok";
                 return hadUpload(req, res);
             }
          });
        });
    }else{
        Forum.update({_id:req.session.cp},{$set:{ques:question}},function(err){
            if(err) return hadDbError(err, req, res);
            return hadEdited(req, res);
        });
    }
});

function hadUrlError(req ,res){
    req.session.error_status = 5;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadDbError(err, req, res){
    console.log(err);
    req.session.error_status = 6;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadUpload(req, res){
    req.session.error_status = 14;
    req.session.qbi = true;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadEdited(req, res){
    req.session.qbai = true;
    req.session.error_status = 21;
    res.redirect('/question_board_view?' + req.session.cp);
    mongoose.disconnect();
}

module.exports = router;

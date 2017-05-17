var express = require('express');
var router = express.Router();

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;
var Forum = models.Forum;

router.get('/', function(req, res, next){
    //データベース接続設定
    var db = mongoose.connection;
    db.on('open', function() {
    });
    db.on('close', function() {
    });
    db.open("mongodb://localhost:27017/userdata");
    if(req.session.user_id){//セッションにidが存在するか確認
        var obj_id = req.session.obj_id;
        //console.log(obj_id);
        User.find({_id:obj_id}, function(err, result) {
            if(err) return hadDbError(err, req, res);
            if (result) {
                if (result.length === 0) {//同じuidが無い場合はDB上にデータが見つからないので0
                    return hadDbError(err, req, res);
                } else {
                    //uidが見つかった
                    //console.log("such uid");
                    var user_name = result[0].name;
                    var user_id = result[0].uid;
                    var user_age = result[0].age;
                    var user_work = result[0].work;
                    var user_sex;
                    var user_bac; //baのカウント
                    var user_profile = result[0].prop;
                    var user_language = result[0].uf_pl;
                    if(result[0].sex === 0){
                        user_sex = '男';
                    }else if(result[0].sex === 1){
                        user_sex = '女';
                    }else{
                        user_sex ='';
                    }
                    Forum.find({hostid:obj_id},{}, {sort:{uday: -1},limit:30},function(err, result2){
                            if(err) return hadDbError(err, req, res);
                            if(result2){
                                var dataurl = [];//質問履歴アクセス用
                                var datafoname = [];
                                for(var i = 0; result2.length > i; i++){
                                    dataurl.push("/question_board_view?"+ result2[i]._id);
                                    datafoname.push(result2[i].foname);
                                }
                                Forum.find({abaid:obj_id},{},{sort:{uday: -1},limit:30},function(err, result3){
                                    if(err) return hadDbError(err, req, res);
                                    if(result3){
                                        user_bac = result3.length;
                                        //console.log(user_bac);
                                        var dataurl2 =[];//BA通知アクセス用
                                        var datafoname2 =[];
                                        for(i = 0; result3.length > i; i++){
                                            dataurl2.push("/question_board_view?"+ result3[i]._id);
                                            datafoname2.push(result3[i].foname);
                                        }
                                        var insert = {
                                            userName:req.session.user_name,
                                            user_name:user_name,
                                            user_id:user_id,
                                            user_age:user_age,
                                            user_work:user_work,
                                            user_sex:user_sex,
                                            user_language:user_language,
                                            user_profile:user_profile,
                                            dataurl:dataurl,
                                            datafoname:datafoname,
                                            dataurl2:dataurl2,
                                            datafoname2:datafoname2,
                                            databac:user_bac
                                        };
                                        req.session.error_status = 0;
                                        res.locals = insert;//テンプレートに読み込む
                                        res.render('mypage');
                                        mongoose.disconnect();
                                    }
                                });
                            }
                    });
                }
            }
        });
    }else{
        return hadNologinError(req, res);
    }
});

//エラーハンドラ
function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/');
    mongoose.disconnect();
}

function hadNologinError(req, res){
    //req.session.error_status = 10;
    res.redirect('/login');
    mongoose.disconnect();
}

module.exports = router;

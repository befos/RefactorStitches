var express = require('express');
var router = express.Router();
var url = require('url');

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;
var Forum = models.Forum;

router.get('/', function(req, res, next) {
    //console.log(req.url);
    if (req.url.match(/.*\?.*/)) {//もしクエリが設定されていなかったら
        mongoose.connect('mongodb://localhost:27017/userdata', function() {
            //console.log('connected');
        });
        if (req.session.user_id) {
            var userName = req.session.user_name;
        }else{
            var userName = "ゲスト"
        }
        var u = url.parse(req.url, false);
        User.find({_id: u.query}, function(err, result) {
            if (err) return hadDbError(err, req, res);
            if (result) {
                if (result.length === 0) { //同じuidが無い場合はDB上にデータが見つからないので0
                    return hadNotcontentsError(req, res);
                } else { //uidが見つかった
                    //console.log("such uid");
                    var openmypage = result[0].mypage_st;
                    if(openmypage === false){//マイページの公開設定が非公開の場合
                        return hadUrlError(req, res);
                    }
                    var user_name = result[0].name;
                    var user_id = result[0].uid;
                    var user_age = result[0].age;
                    var user_work = result[0].work;
                    var user_profile = result[0].prop;
                    var user_language = result[0].uf_pl;
                    var user_sex;
                    var user_bac;
                    if (result[0].sex === 0) {
                        user_sex = '男';
                    } else if (result[0].sex == 1) {
                        user_sex = '女';
                    } else {
                        user_sex = '';
                    }
                    Forum.find({hostid:u.query},{}, {sort:{uday: -1},limit:30},function(err, result2){
                            if(err) return hadDbError(err, req, res);
                            if(result2){
                                var dataurl = [];
                                var datafoname = [];
                                for(var i = 0; result2.length > i; i++){
                                    dataurl.push("/question_board_view?"+ result2[i]._id);
                                    datafoname.push(result2[i].foname);
                                }
                                Forum.find({abaid:u.query},{},{},function(err, result3){
                                    if(err) return hadDbError(err, req, res);
                                    if(result3){
                                        user_bac = result3.length;
                                        //console.log(user_bac);
                                        var insert = {
                                            userName:userName,
                                            user_name:user_name,
                                            user_id:user_id,
                                            user_age:user_age,
                                            user_work:user_work,
                                            user_profile:user_profile,
                                            user_sex:user_sex,
                                            user_language:user_language,
                                            outlook_user:user_name,
                                            dataurl:dataurl,
                                            datafoname:datafoname,
                                            databac:user_bac
                                        };
                                        req.session.error_status = 0;
                                        res.locals = insert;//テンプレートに読み込む
                                        res.render('outlook_mypage');
                                        mongoose.disconnect();
                                    }
                                });
                            }
                    });
                }
            }
        });
    } else {
        return hadUrlError(req, res);
    }
});

//エラーハンドラ
function hadUrlError(req ,res){
    req.session.error_status = 5;
    res.redirect('/');
    mongoose.disconnect();
}

function hadDbError(err, req, res) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/');
    mongoose.disconnect();
}

function hadNotcontentsError(req, res){
    req.session.error_status = 17;
    res.redirect('/');
    mongoose.disconnect();
}

module.exports = router;

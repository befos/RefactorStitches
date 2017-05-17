var express = require('express');
var router = express.Router();

/*DB関係*/
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

router.get('/', function(req, res, next) {
    //console.log(req.session.error_status);
    //res.sendFile(process.cwd() + "/public/login.html"); //静的コンテンツの参照(絶対パス)
    if (req.session.user_id) {
        req.session.error_status = 0;
        res.render('prof_change', {
            userName: req.session.user_name,
            error: error,
            reqCsrf: req.csrfToken(),
            login:'マイページ'
        }); //ログイン済みなのでリダイレクト
    } else {
        var error = req.session.error_status;
        req.session.error_status = 0;
        res.render('login', {error:error, reqCsrf: req.csrfToken(), login:'ログイン', userName:'ゲスト'});
    }
});

router.post('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
        //console.log('connected');
    });
    var hituzi = req.body.profselect;
    if(hituzi === undefined){//何も画像が選択されていないのでリダイレクト
        res.redirect('/prof_change');
        mongoose.disconnect();
    }

    User.update({_id:req.session.obj_id},{$set:{prop:hituzi}},function(err){
        if(err) return hadDbError(err, req, res);
        res.redirect('/mypage');
        mongoose.disconnect();
    });
});
//エラーハンドル
function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}
module.exports = router;

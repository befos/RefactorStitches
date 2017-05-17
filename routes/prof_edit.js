var express = require('express');
var router = express.Router();

/*DB関係*/
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

router.get('/', function(req, res, next) {
    if (!req.session.user_id) return hadNotloginError(req, res);
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
        //console.log('connected');
    });
        User.find({_id:req.session.obj_id},{},{},function(err, result){
            if(err) return hadDbError(err, req, res);
            var data = {
                "name":result[0].name,
                "age":result[0].age,
                "work":result[0].work,
                "uf_pl":result[0].uf_pl
            };
            var error = req.session.error_status;
            req.session.error_status = 0;
            res.render('prof_edit', {
                userName: req.session.user_name,
                error: error,
                reqCsrf: req.csrfToken(),
                login:'マイページ',
                data:data
            }); //ログイン済みなのでリダイレクト
            mongoose.disconnect();
        });
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

function hadNotloginError(req, res) {
    req.session.error_status = 10;
    res.redirect('/login');
    mongoose.disconnect();
}
module.exports = router;

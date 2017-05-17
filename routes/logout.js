var express = require('express');
var router = express.Router();

//データベース接続および設定
var mongoose = require('mongoose');
var models = require('../models/models.js');
var User = models.Users;

router.get('/', function(req, res, next) {
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
    //console.log('connected');
    });
    if(req.session.user_id){
        var obj_id = req.session.obj_id;
        User.update({_id:obj_id},{$set:{ac_use:false}},function(err){
            if(err) return hadDbError(err, req, res);
            if(!err){
                req.session.destroy();
                mongoose.disconnect();
                res.redirect('/');
            }
        });
    }else{
        return hadLogoutError(req, res);
    }
});

function hadDbError(err, req, res){
    //console.log(err);
    req.session.error_status = 6;
    mongoose.disconnect();
    res.redirect('/');
}

function hadLogoutError(req, res){
    req.session.error_status = 11;
    mongoose.disconnect();
    res.redirect('/');
}


module.exports = router;

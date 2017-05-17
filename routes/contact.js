var express = require('express');
var router = express.Router();
var template = require('../config/template.json');

router.get('/', function(req, res, next) {
    if(req.session.user_id){
        req.session.error_status = 0;
        req.session.con = false;
        res.locals = template.common.true;//共通なテンプレートに読み込む
        res.render('contact',{userName:req.session.user_name,reqCsrf:req.csrfToken()});
    }else{
        req.session.error_status = 0;
        req.session.con = false;
        res.locals = template.common.false;//共通なテンプレートに読み込む
        res.render('contact',{reqCsrf:req.csrfToken()});
    }
});

module.exports = router;

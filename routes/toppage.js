var express = require('express');
var router = express.Router();
var template = require('../config/template.json');

router.get('/', function(req, res, next) {
    //console.log(req.session.error_status);
    if (req.session.user_id) {
        var error = req.session.error_status;
        res.locals = template.common.true;//共通なテンプレートに読み込む
        req.session.error_status = 0;
        res.render('toppage', {userName: req.session.user_name, error:error, reqCsrf:req.csrfToken(), loginst:'ok'});
    } else {
        var error = req.session.error_status;
        res.locals = template.common.false;//共通なテンプレートに読み込む
        req.session.error_status = 0;
        res.render('toppage', {reqCsrf:req.csrfToken(), error:error , loginst:'no'});
    }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var template = require('../config/template.json');

router.post('/', function(req, res, next){
    //ここでは入力されたタグのエスケープ処理などを行うこと
    var title = req.body.input_title;
    var tag = [];
    var cont = req.body.input;
    var error = req.session.error_status;
    var hostid = req.session.obj_id;
    var host = req.session.user_name;
    var status = req.body.edit;
    req.session.error_status = 0;
    req.session.tag = tag;
    if (req.session.user_id) {
        res.locals = template.common.true;
        res.render('qna_ansconfirm', {
            userName: req.session.user_name,
            error: error,
            reqCsrf: req.csrfToken(),
            title:title,
            cont:cont,
            hostid:hostid,
            host:host,
            status:status
        });
    } else {
        return hadNotloginError(req, res);
    }
});

function hadNotloginError(req, res) {
    req.session.error_status = 10;
    res.redirect('/login');
    mongoose.disconnect();
}

module.exports = router;

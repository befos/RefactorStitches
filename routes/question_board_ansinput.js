var express = require('express');
var router = express.Router();
var url = require('url');
var template = require('../config/template.json');

router.get('/', function(req, res, next) {
    /*この下からページのレンダー処理*/
    var u = url.parse(req.url, false);
    var obj_id = u.query;
    var error = req.session.error_status;
    req.session.error_status = 0;
    req.session.foid = obj_id;
    if (req.session.user_id) {
        req.session.qbai = false;
        res.locals = template.common.true; //varからここまででテンプレートに代入する値を入れている
        res.render('qna_ansinput', {
            userName: req.session.user_name,
            error: error,
            reqCsrf: req.csrfToken(),
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

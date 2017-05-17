var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //console.log(req.session.error_status);
    //res.sendFile(process.cwd() + "/public/login.html"); //静的コンテンツの参照(絶対パス)
    if (req.session.user_id) {
        req.session.error_status = 0;
        res.redirect('/mypage'); //ログイン済みなのでリダイレクト
    } else {
        var error = req.session.error_status;
        req.session.error_status = 0;
        res.render('login', {error:error, reqCsrf: req.csrfToken(), login:'ログイン', userName:'ゲスト'});
    }
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user_id) {//セッションにユーザIDが格納されているかを判定
    res.render('home', { title: 'Hello Users!（X3）' });
  } else {
    res.redirect('/login');//ログインしてないのでログイン画面にリダイレクト
  }
});

module.exports = router;

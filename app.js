var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var connect = require('connect');
var ConnectMongoDB = require('connect-mongo')(session);
var store = new ConnectMongoDB({ //セッション管理用DB接続設定
    url: 'mongodb://localhost:27017/sessiondata',
    ttl: 60 * 60 //1hour
});
var csurf = require('csurf');
var helmet = require('helmet');
var RateLimit = require('express-rate-limit');


var routes = require('./routes/index.js');

var app = express();

// サーバーの起動を告知
//console.log('stitches app listening at localhost:8080');

// view engine setup
app.set('views', path.join(__dirname, 'views'));//joinは結合（__dirnameはソースが入っているディレクトリを表す）
app.set('view engine', 'ejs');

/*
*proxyから送信される内容をhttpsとして信用する.
*/
app.set('trust proxy', 1);// trust first proxy

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static',express.static(path.join(__dirname, 'public')));
var secure = true;
if (app.get('env') === 'development') {
    secure = false;
}else{
    secure = true;
}
app.use(session({ // cookieに書き込むsessionの仕様を定める
    secret: 'ajax-hohoho', // 符号化。改ざんを防ぐ
    store: store,
    proxy: true,
    resave: false,
    saveUninitialized: true,
    cookie:{
        secure: secure,//デプロイ時にtrueにする
        httpOnly: true,
        maxAge: 60 * 60 * 1000 //60s*60m*1000ms ＝ 1hour.
    }
}));
app.use(csurf());//セッションとクッキーパーサーの設定後に記述
app.use(helmet());

//RateLimitの設定（Dos対策及び総当たり攻撃対策）
var limiter = new RateLimit({
  windowMs: 15*60*1000, // 15 minutes
  max: 1500, // limit each IP to 100 requests per windowMs1170
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  message: "異常な量のアクセスが検知されました。しばらくの間このIPからのアクセスは制限されます。"
});

app.use(limiter);


//ページを追加する場合に追加で記述
app.use('/', routes.toppage); //ページへのルートを記す(新規追加の場合はindex.jsファイル内の配列に追加)
app.use('/mypage', routes.mypage);
app.use('/prof_change', routes.prof_change);
app.use('/prof_edit', routes.prof_edit);
app.use('/outlook_mypage', routes.outlook_mypage);
app.use('/login', routes.login);
app.use('/login_check', routes.login_check);
app.use('/logout', routes.logout);
app.use('/register', routes.register);
app.use('/register_check', routes.register_check);
app.use('/register_submit', routes.register_submit);
app.use('/register_confirm', routes.register_confirm);
app.use('/password_reset', routes.password_reset);
app.use('/password_reset_mail', routes.password_reset_mail);
app.use('/password_reset_regene', routes.password_reset_regene);
app.use('/password_reset_submit', routes.password_reset_submit);
app.use('/email_change', routes.email_change);
app.use('/email_change_mail', routes.email_change_mail);
app.use('/email_change_task', routes.email_change_task);
app.use('/email_change_submit', routes.email_change_submit);
app.use('/qna_noans', routes.qna_noans);
app.use('/qna_eq', routes.qna_eq);
app.use('/qna_bq', routes.qna_bq);
app.use('/qna_bq_up', routes.qna_bq_up);
app.use('/qna_diff', routes.qna_diff);
app.use('/question_board_top', routes.question_board_top);
app.use('/question_board_top_cate', routes.question_board_top_cate);
app.use('/question_board_top_search', routes.question_board_top_search);
app.use('/question_board_input', routes.question_board_input);
app.use('/question_board_ansinput', routes.question_board_ansinput);
app.use('/question_board_confirm', routes.question_board_confirem);
app.use('/question_board_ansconfirm', routes.question_board_ansconfirem);
app.use('/question_board_submit', routes.question_board_submit);
app.use('/question_board_anssubmit', routes.question_board_anssubmit);
app.use('/question_board_view', routes.question_board_view);
app.use('/question_board_ba', routes.question_board_ba);
app.use('/contact', routes.contact);
app.use('/contact_submit', routes.contact_submit);

//ミドルウェアを使いつくしたので404を生成
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app; // bin/wwwファイルなどで

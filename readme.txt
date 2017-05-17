※重要
  //console.log('hoge');はプログラムを遅くする原因なのでデプロイ時は全て消す
  デプロイ時にはDevelopmentモードをProductモードに変える
  nginx関係だが、デプロイ時に専用ユーザーを作ってそのユーザで管理する

ITweb.repoのファイル構造についての説明
  bin //サーバー起動時のリッスンポートなどについて記述したファイルを入れるディレクトリ
  config //ejs用の共通のテンプレートやメールを送信する際の設定などが入っている
  models //db用のスキーマが入っているディレクトリ
  node_modules //触らないで。
  public //静的コンテンツを配置するディレクトリ(.html,.css,.js)(htmlファイルはpublic直下に置く)
  routes //ルーティングに関するファイルを配置
  views //ejsファイルを配置 ※ejsファイルとはテンプレートエンジンである(中身はhtmlとほぼ同じ)
  app.js //サーバーの根幹,設定やエラーハンドラなどが書かれている。 編集には十分注意
  package.json //パッケージのバージョンが記述してあるJsonファイル(絶対消さないで)

webページを追加する
  1.routesディレクトリ内に追加したいページ名と同じ名前の.jsファイルを追加(中身は前のコードを参考に)
  2.routes/index.js内の配列にカレントディレクトリに先ほど置いた.jsファイルを記述
  3.app.jsファイルのapp.use(/hoge, routes.hoge);を記述
  4.localhost/hoge　でアクセス可能！やったぜ

dbに接続する方法
var mongoose = require('mongoose');
var models = require('../models/models.js');
var hoge = models.hoge;//スキーマの参照

制御方法
  Example
  mongoose.connect('mongodb://localhost:27017/userdata');//接続先のDB
  hoge.find({url_pass:u.query}, function(err, result) {
          if(err) return hadHogeError(err, req, res);//事前にエラーハンドラを用意しておきerrが返ってきた場合は即リターンさせる
          if (result) {
              if (result.length === 0) {//result.length === 0とはデータが見つからない状態を表す
                  //console.log("nosuch");
                  req.session.error_status = 1;
                  res.redirect('/register');
                  mongoose.disconnect(); //最後に絶対disconnectする事
              }
          }
    });
//エラーハンドラの記述（例）
function hadInputdataError(err, req, res){
    req.session.error_status = 1;
    res.redirect('/hoge');
    mongoose.disconnect();
}

 セッション
  ~connect-mongo + express-session~
  var ConnectMongoDB = require('connect-mongo')(session);
  var store = new ConnectMongoDB({ //セッション管理用DB接続設定
      url: 'mongodb://localhost:27017/sessiondata',
      ttl: 60 * 60 //1hour
  });
  app.use(session({         // cookieに書き込むsessionの仕様を定める
    secret: 'ajax-hohoho',               // 符号化。改ざんを防ぐ
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: { //cookieのデフォルト内容
      httpOnly: false,
      maxAge: 60 * 60 * 1000
    }
  }));

javascriptの非同期での動かし方
  スクリプトを非同期にダウンロードし、スクリプトは直ちに実行されます。
  <script async src="hoge.js"></script>
  スクリプトを非同期にダウンロードし、スクリプトはページの解析が終了したら実行されます。
  <script defer src="hoge.js"></script>
  async として解釈される。ただし async に未対応のブラウザは defer と解釈する。両方に対応していなければ指定は無視される。
  <script async defer src="hoge.js"></script>
  遅延読み込みで見える部分を優先する
  ※注意点
  ローカル環境でエラーを吐いた場面があったがサーバーからダウンロードする時は問題が無かったので、デプロイ時にはこのオプションをつけること
  <script src="/js/Dfolder/jquery-3.1.1.min.js"></script>
  ↑これには絶対に async 及び　deferを付けないこと読み込まれる順番がおかしくなるため

 現在時刻の取得方法
    require('date-utils');
    var hoge = new Date();//現在時刻取得
    var fuga = hoge.toFormat("YYYY/MM/DD HH24:MI:SS");←フォーマットで自由に形を変えられるよ

nodeやnpmのエラー対処
  本当に困ったらこれ↓
  【その1】 Node.jsの再インストール
    $ node -v
    $ sudo npm cache clean -f
    $ sudo npm install -g n
    $ sudo n stable
    $ node -v
    で、再インストール。
  【その2】 npmの再インストール
    $ npm install -g npm
   その3 node.js　インストール時に死にかけたら
   sudo apt-get install nodejs-legacy

 Socket hung up　のエラーが出た場合
   セキュリティソフトが悪さをしている可能性が高い

 transporter.sendMail(mailOptions, function(err, resp) { //メールの送信
       if (err) { //送信に失敗したとき
           transporter.close();
           return hadSendmailError(err, req, res, resp);
       }
       if (!err) { //送信に成功したとき
           //console.log('Message sent');
       }
       transporter.close(); //SMTPの切断
       X res.render();
       X mongoose.redirect();
   });
   〇 res.render();
   〇 mongoose.redirect();
   メールの送信処理のすぐ後にページのレンダーを書かないこと（非同期にならずにページの表示が遅くなる）

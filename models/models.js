var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

    var Users = new Schema({
      email: {type:String, required:true, index:true, unique:true},//Email(被りなし変更化)
      uid: {type:String, required:true, index:true, unique:true},//uid(被りなし)
      name: {type:String, index:true},//ユーザーネーム（被りok!）(あとで変更可能)
      age: {type:String, index:true},//年齢
      sex: {type: Number, min:0, max:1},//0男性 1女性
      work: {type:String, index:true},//職業
      uf_pl: {type:String, index:true},//得意な言語//useful programing language
      place: String,//自分の住んでいる場所
      hashpass: {type:String, index:true},//ハッシュ化されたパスワード
      salt: {type:String, index:true},//お塩
      prop: {type:String, index:true},//プロフィール用画像のURL予定
      url_pass: {type:String, index:true},//認証用の一時url(regiser)
      url_pass2: {type:String, index:true},//認証用の一時url(passreset)
      url_pass3: {type:String, index:true},//認証用の一時url(email_change)
      groupe: String,//所属しているグループ名
      regest: {type: Date, default: Date.now},//新規登録した時間の十分後
      regent: {type: Date, default: Date.now},//パスワードリセットを申請した時間の十分後
      ect: {type: Date, default: Date.now},//メールアドレス変更を申請した十分後
      ac_st: {type: Boolean, default:false},//accountstatus falseなら仮登録中
      ac_use: {type: Boolean, default:false},//現在accountが使用中か確認
      ac_reset: {type:Boolean, default:false},//現在accountのパスワードがリセット状態にあるか
      ac_ec: {type:Boolean, default:false},//現在accountのemailが変更されようとしているか
      ac_gr: {type:Boolean, default:false},//現在accountがグループに所属しているか
      mypage_st: {type:Boolean, default:true},//現在マイページを他人に公開しているか（デフォルトはtrue）(公開)
      cemail: String//変更時に一時的にEメールアドレスを保存
    },{ collection:'user'});

    var Forum = new Schema({
        foname: String,//フォーラムの名前（被りあり）
        hostid: {type:Schema.Types.ObjectId, index:true},//obj_idから主催者のデータを拾う
        host: String,//ユーザーのIDを格納
        count: Number,//アクセスされた回数
        uday: {type:Date, index:true},//アップロードした日
        ques: String,//質問者が入力(質問内容)
        baid: [{type:Schema.Types.ObjectId, index:true}],//ベストアンサーに選ばれた回答のIDを記録
        abaid: [{type:Schema.Types.ObjectId, index:true}],//ベストアンサーに選ばれた回答者のIDを記録
        diff: {type:Number, min:0, max:2},//難易度（0簡単、1普通、2難しい）
        tag: [String],//この中に言語も記述してもらう(ニコ動のタグみたいなもの)
        bq:[{type:Schema.Types.ObjectId, index:true}],//BQボタンを押した人のオブジェクトIDを格納
        f_st: {type:Boolean, default:true},//forumの内容が解決済みか
        cont: [{type: Schema.Types.ObjectId, ref: 'ForumCont'}]
    },{collection: 'forum'});


    var ForumCont = new Schema({
        //forumcontの_idはforumのIDと同じになる
        mfo: {type:Schema.Types.ObjectId, ref: 'Forum', index:true},
        _conid: {type:Schema.Types.ObjectId, index:true},//コンテンツID
        answer: {type:Schema.Types.ObjectId, index:true},
        name: {type:String, index:true},//ユーザーが決めた自由な名前
        prop: String,//プロフィールの画像？
        cuday: {type:Date, default: Date.now},//コンテンツを上げた日
        chday: Date,//内容を編集した日
        text: String//回答者が入力(回答内容)
    },{collection:'forumcont'});


    //質問掲示板メモ　話題の質問　自分が出した質問

    Users.plugin(uniqueValidator);
    Forum.plugin(uniqueValidator);
    ForumCont.plugin(uniqueValidator);

    mongoose.Promise = global.Promise;
    exports.Users = mongoose.model("Users", Users);
    exports.Forum = mongoose.model("Forum", Forum);
    exports.ForumCont = mongoose.model("ForumCont", ForumCont);

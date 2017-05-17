var express = require('express');
var router = express.Router();
var url = require('url');
var qstring =require("querystring");
var async = require("async");
var template = require('../config/template.json');

/*データベースの接続設定*/
var mongoose = require('mongoose');
var models = require('../models/models.js');　
var Forum = models.Forum;
var User = models.Users;

router.get('/', function(req, res, next) {
    var u = url.parse(req.url, false);
    var query = qstring.parse(u.query);
    var error = req.session.error_status;
    //console.log(query.cate);
    //console.log(query.page);

    var data = {//DBから引っこ抜いてきた情報を連想配列の配列に格納
        "dataurl": [],
        "datatitle": [],
        "datauser": [],
        "dataupday": [],
        "dataans": [],
        "datadiff": [],
        "datahostid": [],
        "status":"",
        "pbutton":[],
        "dataouturl":[],
        "tag":[]
    };

    var selectf;//データベースからデータを取り出すための変数
    var selectb;//データベースからデータを取り出すための変数

    if(query.page == 1){
        selectb = 0;
        selectf = 1 * 20 - 1;
    }else{
        selectf = query.page * 20 - 1;
        selectb = selectf - 20;
    }

    /*データベース接続*/
    mongoose.connect('mongodb://localhost:27017/userdata', function(){
        //console.log("connected");
    });
    Forum.find({tag:{$elemMatch:{$eq:query.cate}}},{}, {sort:{uday: -1}}, function(err, result) {
        if (err) return hadDbError(err, req, res);
        if (result) {
            if (result.length === 0) { //同じ_idが無い場合はDB上にデータが見つからないので0
                //console.log("nosuch");
                return hadNotcontentsError(req, res);
            }else{
                    //console.log(result);
                for(i = selectb ; result.length > i && selectf > i ; i++){　
                    var fourl = "/question_board_view?" + result[i]._id;//フォーラムアクセス用のURLを作成
                    var outurl = "/outlook_mypage?" + result[i].hostid;
                    data.dataurl.push(fourl);//作成したものをプッシュ
                    data.dataouturl.push(outurl);
                    data.datatitle.push(result[i].foname);
                    data.dataupday.push(result[i].uday.toFormat("YYYY/MM/DD HH24:MI:SS"));
                    data.datahostid.push(result[i].hostid);
                    if(result[i].f_st === true){
                        data.dataans.push("/img/profile/未解決.png");
                    }else{
                        data.dataans.push("/img/profile/解決済み.png");
                    }
                    if(result[i].diff === 0){
                        data.datadiff.push("/img/profile/簡単.png");
                    }else if(result[i].diff === 1){
                        data.datadiff.push("/img/profile/普通.png");
                    }else{
                        data.datadiff.push("/img/profile/難しい.png");
                    }
                    var itizi = [];
                    for(var h = 0 ; h < result[i].tag.length ; h++){
                        itizi.push(result[i].tag[h]);
                    }
                    data.tag[i] = itizi;
                }
                var list = [//ユーザーIDの保存領域
                ];

                for(i = 0 ; i < data.datahostid.length ; i++){
                    list.push({id:data.datahostid[i]});
                }
                //console.log(list);
                async.eachSeries(list, function(data2, next) {//ユーザーIDをキーにして動的にWebページの投稿者名を変更する
                    setTimeout(function() {
                        User.find({_id:data2.id},{},function(err, result3){
                            if(err) return hadDbError(err, req, res);
                            data.datauser.push(result3[0].name);
                            next();
                        });
                    }, 0);
                }, function(err) {
                    /*データベースの処理終了*/
                    /*--ページネーションを使えるようにするための設定--*/　
                    var nextback ={
                        "backurl":"/question_board_top",
                        "nexturl":"/question_board_top",
                        "nextbutton":"",
                        "badkbutton":""
                    };
                    var insclass ={
                        "insclass1":"dummy",
                        "insclass2":"dummy",
                        "insclass3":"dummy",
                        "insclass4":"dummy",
                        "insclass5":"dummy"
                    };
                    data.pbutton =[
                        "/question_board_top_cate?",
                        "/question_board_top_cate?",
                        "/question_board_top_cate?",
                        "/question_board_top_cate?",
                        "/question_board_top_cate?"
                    ];
                    for(i = 0 ; i < 5 ; i++){
                        var itizi;
                        itizi = i+1;
                        data.pbutton[i] = data.pbutton[i] + "cate=" + query.cate + "&page=" + itizi;
                        //console.log(data.pbutton[i]);
                    }
                    data.status = "cate";
                    //console.log(data.status);
                    switch (query.page) {
                        case '1':
                            insclass.insclass1 = "active";
                            nextback.backurl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=1";
                            nextback.nexturl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=2";
                            nextback.backbutton = "disabled";
                            break;
                        case '2':
                            insclass.insclass2 = "active";
                            nextback.backurl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=1";
                            nextback.nexturl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=3";
                            break;
                        case '3':
                            insclass.insclass3 = "active";
                            nextback.backurl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=2";
                            nextback.nexturl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=4";
                            break;
                        case '4':
                            insclass.insclass4 = "active";
                            nextback.backurl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=3";
                            nextback.nexturl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=5";
                            break;
                        case '5':
                            insclass.insclass5 = "active";
                            nextback.backurl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=4";
                            nextback.nexturl = "/question_board_top_cate?" + "cate=" + query.cate + "&page=5";
                            nextback.nextbutton = "disabled";
                            break;//ここのスイッチ文でオブジェクトに値を格納し、ページネーションで使えるようにしている
                    default:
                        return hadUrlError(req ,res);
                    }
                    /*--ページネーション設定はここまで--*/
                    /*この下からページのレンダー処理*/
                    req.session.error_status = 0;
                    if (req.session.user_id) {
                        res.locals = template.common.true; //varからここまででテンプレートに代入する値を入れている
                        res.render('qna', {
                            userName: req.session.user_name,
                            error: error,
                            reqCsrf: req.csrfToken(),
                            data:data,
                            data2:nextback,
                            data3:insclass
                        });
                        mongoose.disconnect();
                    } else {
                        res.locals = template.common.false;
                        res.render('qna', {
                            error: error,
                            reqCsrf: req.csrfToken(),
                            data:data,
                            data2:nextback,
                            data3:insclass
                        });
                        mongoose.disconnect();
                    }
                });
            }
        }
    });
});

function hadNotcontentsError(req, res){
    req.session.error_status = 15;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadUrlError(req ,res){
    req.session.error_status = 5;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

function hadDbError(err, req, res) {
    //console.log(err);
    req.session.error_status = 6;
    res.redirect('/question_board_top');
    mongoose.disconnect();
}

module.exports = router;

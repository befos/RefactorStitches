var passwordLevel = 0;

function setMessage(password) {
    passwordLevel = getPasswordLevel(password);
    var message = "";
    if (passwordLevel == 1) {
        message = "弱い";
    }
    if (passwordLevel == 2) {
        message = "やや弱い";
    }
    if (passwordLevel == 3) {
        message = "普通";
    }
    if (passwordLevel == 4) {
        message = "やや強い";
    }
    if (passwordLevel == 5) {
        message = "強い";
    }

    var div = document.getElementById("pass_message");
    if (!div.hasFistChild) {
        div.appendChild(document.createTextNode(""));
    }
    div.firstChild.data = message;
}

/*
 * パスワード一致チェック
 */
function setConfirmMessage(confirm_password) {
    var password = document.getElementById("password").value;
    var message = "";
    if (password == confirm_password) {
        message = "";
    } else {
        message = "パスワードが一致しません";
    }

    var div = document.getElementById("pass_confirm_message");
    if (!div.hasFistChild) {
        div.appendChild(document.createTextNode(""));
    }
    div.firstChild.data = message;
}

/*
 * Email一致チェック
 */
function setConfirmMessage1(confirm_Email) {
    var Email = document.getElementById("Email").value;
    var message = "";
    if (Email == confirm_Email) {
        message = "";
    } else {
        message = "メールアドレスが一致しません";
    }
    var div = document.getElementById("Email_confirm_message");
    if (!div.hasFistChild) {
        div.appendChild(document.createTextNode(""));
    }
    div.firstChild.data = message;
}

function setError() { //リダイレクトされて戻ってきた時のエラー文表示
    var Error_status = document.getElementById("Error_status").value;
    switch (Error_status) {
        case '0':
            break;
        case '1':
            alert("入力された情報が間違っています。");
            location.reload(true);
            break;
        case '2':
            alert("入力されたIDまたはアドレスは登録済みです。");
            location.reload(true);
            break;
        case '3':
            alert("このアカウントは承認済みです。");
            location.reload(true);
            break;
        case '4':
            alert("メールの送信に失敗しました。");
            location.reload(true);
            break;
        case '5':
            alert("不正なアクセスです。");
            location.reload(true);
            break;
        case '6':
            alert("DBのエラーです。");
            location.reload(true);
            break;
        case '7':
            alert("パスワードリセットが要求済みです。");
            location.reload(true);
            break;
        case '8':
            alert("セッションエラーです。");
            location.reload(true);
            break;
        case '9':
            alert("アカウントが仮登録の状態です。");
            location.reload(true);
            break;
        case '10':
            alert("ログインされていません。");
            location.reload(true);
            break;
        case '11':
            alert("既にログアウトされています。");
            location.reload(true);
            break;
        case '12':
            alert("お問い合わせ頂きありがとうございます。");
            location.reload(true);
            break;
        case '13':
            alert("異常なアクセスが検知されたので一時的にアクセスを制限します。");
            location.reload(true);
            break;
        case '14':
            alert("投稿処理が完了いたしました。");
            location.reload(true);
            break;
        case '15':
            alert("現在質問は投稿されていません。");
            location.reload(true);
            break;
        case '16':
            alert("質問は解決済みです。");
            location.reload(true);
            break;
        case '17':
            alert("マイページは公開されていません。");
            location.reload(true);
            break;
        case '18':
            alert("質問に高評価を付けました！");
            location.reload(true);
            break;
        case '19':
            alert("あなたは既に質問に高評価を付けています。");
            location.reload(true);
            break;
        case '20':
            alert("あなたは質問の投稿者ではありません。");
            location.reload(true);
            break;
        case '21':
            alert("変更が完了しました。");
            location.reload(true);
            break;
    }
}
window.onload = setError;

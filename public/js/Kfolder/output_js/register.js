/*
*結果を表示
*/
function conrimMessage(){
        var id = document.getElementById("id").value;
        var pass = document.getElementById("password").value;
        var conf = document.getElementById("confirm_password").value;

    if((id == "") || (pass == "") || (conf == "")){
            alert("必須項目が入力されていません");
            return false;
        }
        if (pass != conf){
                alert("パスワードが一致していません。");
                return false;
    }
    if (passwordLevel == 1){
        alert("パスワード強度が弱いです。パスワードには最低でも\nアルファベット１つ以上、数字１つ以上を使用して8文字以上にしてください。");
        return false;
    }
    if (passwordLevel == 2){
        return true;
    }
    if (passwrodLevel >= 3){
        return true;
    }
 }

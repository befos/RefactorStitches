/*
*結果を表示
*/
function conrimMessage(){
        var id = document.getElementById("name").value;
        var pass = document.getElementById("address").value;
        var conf = document.getElementById("InputTextarea").value;

    if((id == "") || (pass == "") || (conf == "")){
            alert("必須項目が入力されていません。\nお名前とメールアドレスと内容を入力してください。");
            return false;
    }
 }

function conrimMessage() {
    var id = document.getElementById("Email").value;
    //必須チェック
    if (id == "") {
        alert("必須項目が入力されていません。");
        return false;
    } else {
        return true;
    }
}

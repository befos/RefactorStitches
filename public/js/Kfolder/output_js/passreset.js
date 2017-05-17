/*
 * 登録前チェック
 */
function conrimMessage() {
    var id = document.getElementById("id").value;

    //必須チェック
    if (id == "") {
        alert("必須項目が入力されていません。");
        return false;
    } else {
        return true;
    }
}

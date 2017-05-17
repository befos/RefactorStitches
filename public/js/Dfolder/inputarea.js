$(document).ready(function () {

//ツールバー日本語化
$.cleditor.buttons.source.title = 'ソース表示';
$.cleditor.buttons.bold.title = '太字';
$.cleditor.buttons.italic.title = '斜体';
$.cleditor.buttons.underline.title = '下線';
$.cleditor.buttons.size.title = 'フォントサイズ';
$.cleditor.buttons.color.title = 'フォント色';
$.cleditor.buttons.rule.title = '水平線(hrタグ)';
$.cleditor.buttons.image.title = '画像urlの挿入(imgタグ)';
$.cleditor.buttons.highlight.title = 'ハイライト';
$.cleditor.buttons.removeformat.title = '書式の削除';
$.cleditor.buttons.source.title = 'ソースの確認';
$.cleditor.buttons.link.title = 'リンク(aタグ)';
$.cleditor.buttons.unlink.title = 'リンク削除(aタグ)';
$.cleditor.buttons.table.title = 'テーブル挿入(tableタグ)';

//テーブルの画像PATH修正
$.cleditor.buttons.table.image = "../../img/table.gif";
//テーブルのボタン押した時の表示日本語化
$.cleditor.buttons.table.popupContent = "" +
'横:<input type="text" value="7" maxlength="1" style="width:20px">' +
'縦:<input type="text" value="3" maxlength="1" style="width:20px">' +
'<br /><input type="button" value="決定">',

$("#input").cleditor({
    width: 527, //入力枠の横幅
    height: 350, //入力枠の縦幅
    sizes: "4,5,6,7", //文字サイズ。4が標準、なのか
    // 文字色を<span style="">で指定するのではなく、<font color="">で指定
    useCSS: false,
    // ツールバーで使いたい機能一覧を指定
    controls: "source | bold italic underline | " +
    "size color highlight removeformat " +
    "alignleft center alignright | " +
    "undo redo | rule image link unlink | table",
    bodyStyle:"" //文字サイズが小さかったので初期化
});
});

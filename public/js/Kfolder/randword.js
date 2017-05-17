var MAIN = {};
exports.randword = MAIN;

MAIN.method = function(length){//node.jsのexports用
  // 生成する文字列の長さ
  var l = length;
// 生成する文字列に含める文字セット
  var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var cl = c.length;
  var r = "";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
};

function randword(length){//純正js用
  // 生成する文字列の長さ
  var l = length;
// 生成する文字列に含める文字セット
  var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var cl = c.length;
  var r = "";
  for(var i=0; i<l; i++){
    r += c[Math.floor(Math.random()*cl)];
  }
  return r;
}

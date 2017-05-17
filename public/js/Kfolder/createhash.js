
var crypto = require('crypto');

var MAIN = {};
exports.createhash = MAIN;

MAIN.method = function(password, salt, stretch){
  var hash = crypto.pbkdf2Sync(password, salt, stretch, 256);
  return hash.toString('base64');
};

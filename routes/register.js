var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  //console.log(req.session.error_status);
  var error = req.session.error_status;
  req.session.error_status = 0;
  res.render('register', {error:error,reqCsrf:req.csrfToken()});
});

module.exports = router;

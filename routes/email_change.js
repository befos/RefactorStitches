var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    //console.log(req.session.error_status);
    if (req.session.user_id) {
        var error = req.session.error_status;
        req.session.error_status = 0;
        res.render('email_change', {error:error, reqCsrf:req.csrfToken()});
    }else{
        req.session.error_status = 0;
        res.redirect('/');
    }
});

module.exports = router;

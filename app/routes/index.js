var express = require('express');
var router = express.Router();
router.get('/',function(req, res){
  if(req.session.user!=undefined)
    res.render('index',req.session.user);
  else
    res.render('index');
});
module.exports = router;

var express = require('express');
var router = express.Router();
var fs = require('fs')
router.get('/robots.txt', function(req, res) {
  res.type('text/plain');
  res.render('robots.ejs');
});
module.exports = router;

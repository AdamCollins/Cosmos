var express = require('express');
var router = express.Router();
router.get('/sitemap.xml', function(req, res) {
  res.type('xml/plain');
  res.render('sitemap.ejs');
});
module.exports = router;

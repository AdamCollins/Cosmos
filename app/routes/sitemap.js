var express = require('express');
var router = express.Router();
var xml = require('xml')
router.get('/sitemap.xml', function(req, res) {
  res.type('xml/plain');
  res.render(xml('sitemap.ejs'));
});
module.exports = router;

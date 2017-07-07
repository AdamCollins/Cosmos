var express = require('express');
var router = express.Router();
var postData = require('../data/posts.json');
router.get('/api',function(req, res){
  res.json(postData);
});
module.exports = router;

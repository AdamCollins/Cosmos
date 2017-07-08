var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/learning_mongo'

MongoClient.connect(url, function(err, db){
  console.log('connected successfully to sever');

  db.close();
});


var router = express.Router();
var postData = require('../data/posts.json');
router.get('/api',function(req, res){
  res.json(postData);
});
module.exports = router;

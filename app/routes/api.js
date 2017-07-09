var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var config = require('../data/config');
var dbName = "cosmosdb";
var dbpassword = config.password;

var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
var postData = require('../data/posts.json');
var bodyParser = require('body-parser');
var database = null;

MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log(err);
  }
  database = db
  findDocument(db, function() {
    db.close();
  })
});

function insertPost(db, postData, callback) {
  console.log('here')
  var collection = db.collection('users');
  console.log("COL:" + collection)
  var post = postData.text
  collection.insert({
    "name": post
  })
  console.log('here2')
  callback
}

function findDocument(db, callback) {
  var collection = db.collection('users');
  collection.find().toArray(function(err, doc) {
    //console.log(doc);
    callback
  })
}



router.get('/api', function(req, res) {
  res.json(postData);
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));
router.post('/api', function(req, res) {
  insertPost(database, req.body, function() {
    database.close()
  })
  console.log(req.body);
});
module.exports = router;

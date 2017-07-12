var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var url = 'mongodb://localhost:27017/learning_mongo';
var bodyParser = require('body-parser');
var config = require('../data/config');
var dbName = "cosmosdb";
var dbpassword = config.password;
var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/' + dbName + '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
var database = null;
var bcrypt = require('bcrypt');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

MongoClient.connect(url, function(err, db) {
  if (err)
    console.log(err);

  console.log('connected successfully to sever');
  database = db;
});

router.get('/login', (req, res) => {
  var userCol = database.collection('users');
  userCol.find({}).toArray(function(err, docs) {
    res.json(docs);

  });
});

router.get('/registraion/availible/:username', (req, res) => {
  var userCol = database.collection('users');
  console.log(req.params.username);
  userCol.find({
    "username": {
      $regex: new RegExp("^" + req.params.username.toLowerCase(), "i")
    }
  }).toArray(function(err, docs) {
    if (docs.length > 0)
      res.json({
        "username_exists": true
      });
    else
      res.json({
        "username_exists": false
      });
  });
});


function addUser(userdata, callback) {
  var valid = (database.collection('users').find({
    "username": {
      $regex: new RegExp("^" + userdata.username.toLowerCase(), "i")
    }
  }).count() == 0) ? true : false;

  if (valid) {
    database.collection('users').insertOne({
      "username": userdata.username,
      "password": userdata.password,
      "score": 0,
      "create_date": new Date()
    }, () => {
      database.close();
    });
  } else {
    console.log("ERROR: Bad register");
  }
}


router.post('/login/registraion', (req, res) => {
  console.log(req.body);
  var userdata = req.body;
  addUser(userdata);
});







module.exports = router;

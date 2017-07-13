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
var session = require('express-session');

router.use(bodyParser.json());
router.use(session({
  secret: "asdfghjhrgtygf4etr23retfgcnvhmKJHJGHJKm",
  resave: false,
  saveUninitialized: true
}));
router.use(bodyParser.urlencoded({
  extended: false
}));

MongoClient.connect(url, function(err, db) {
  if (err)
    console.log(err);

  console.log('connected successfully to sever');
  database = db;

});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successfully');
});
router.post('/login', (req, res) => {
  var userCol = database.collection('users');
  userCol.findOne({
    "username": req.body.username
  }, function(err, user) {
    if (user) {
      console.log(req.body);
      console.log(user);
      if (passwordMatchesHash(req.body.password, user.hashed_password)) {
        req.session.user = user;
        console.log('logged ' + user.username + ' successfully!');
      }
    }
  });
});

router.get('/listusers', (req, res) => {
  var userCol = database.collection('users');
  userCol.find({}).toArray(function(err, users) {
    res.json(users);
  });
});

router.get('/registraion/availible/:username', (req, res) => {
  var userCol = database.collection('users');
  userCol.findOne({
    "username": {
      $regex: new RegExp("^" + req.params.username.toLowerCase(), "i")
    }
  }, function(err, docs) {
    if (docs)
      res.json({
        "username_exists": true
      });
    else
      res.json({
        "username_exists": false
      });
  });
});


//TODO recheck if username unique
function addUser(userdata, callback) {
  let hashed_password = bcrypt.hashSync(userdata.password, 10);
  database.collection('users').insertOne({
    "username": userdata.username,
    "hashed_password": hashed_password,
    "score": 0,
    "create_date": new Date()
  }, () => {
    database.close();
  });
}


router.post('/register', (req, res) => {
  console.log(req.body);
  var userdata = req.body;
  addUser(userdata);
});

function passwordMatchesHash(plainTextPassword, hash) {
  return bcrypt.compareSync(plainTextPassword, hash);
}






module.exports = router;

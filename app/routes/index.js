var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var config = require('../data/config');
var dbName = "cosmosdb";
var dbpassword = config.password;
var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/' + dbName + '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
var bcrypt = require('bcrypt');
var session = require('express-session');
var router = express.Router();
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(session({
  cookie: {
    path: '/',
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000
  },
  secret: "asdfghjhrgtygf4etr23retfgcnvhmKJHJGHJKm",
  resave: false,
  saveUninitialized: true
}));




router.get('/', function(req, res) {
  //console.log(req.session.user)
  if (req.session.user)
    MongoClient.connect(url, (err, db) => {
      var users = db.collection('users');
      var query = {'username': {$eq: req.session.user.username.toLowerCase()}}
      users.findOne(query, (err, user)=>{
        if(user){
          var data = {'user': req.session.user, 'score': user.score}
          console.log('here1')
          console.log(data)
          res.render('index', data);
        }
      })
      db.close();
    });
  else{
    var data = {'user': req.session.user, 'score': 0}
    console.log('here2')
    console.log(data)
    res.render('index', data);
  }
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

module.exports = router;

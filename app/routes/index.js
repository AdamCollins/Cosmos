var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var config = require('../data/config');
var dbName = "cosmosdb";
var dbpassword = config.password;
var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/' + dbName + '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
var bcrypt = require('bcrypt');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var router = express.Router();
var cookieParser = require('cookie-parser');
router.use(cookieParser());
router.use(session({
    secret:'foo',
    store: new MongoStore({ 'url': url })
}));



router.get('/', function(req, res) {
  //console.log(req.session.user)
  if (req.session.user)
    res.render('index', req.session.user);
  else
    res.render('index', {
      "username": ""
    });
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

module.exports = router;

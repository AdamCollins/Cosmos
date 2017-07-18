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


router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successfully');
});
router.post('/login', (req, res) => {
  MongoClient.connect(url, (err, database) => {
    var userCol = database.collection('users');
    //console.log(1)
    //console.log(req.body.username)
    userCol.findOne({
      "username": req.body.username
    }, function(err, user) {
      //console.log(user)
      if (user) {
       // console.log(req.body);
        //console.log(user);
        //console.log(3)
        if (passwordMatchesHash(req.body.password, user.hashed_password)) {
          req.session.user = user;
          req.session.save();
          //console.log('logged ' + req.session.user.username + ' successfully!');
          res.json({
            "success": "Logged in Successfully",
            "status": 200
          });
        } else {
          res.json({
            "error": "Failed to authenticate",
            "status": 401
          });
        }
      } else {
        res.json({
          "error": "Failed to authenticate",
          "status": 401
        });
      }
    });
    database.close();
  });
});


router.get('/listusers', (req, res) => {
  MongoClient.connect(url, (err, database) => {
    var userCol = database.collection('users');
    userCol.find({}).toArray(function(err, users) {
      res.json(users);
    });
    database.close();
  });
});

router.get('/users/score/:username', (req, res) => {
  MongoClient.connect(url, (err, database) => {
    var userCol = database.collection('users');
    var query = {
      "username": {
        $regex: new RegExp("^" + req.params.username.toLowerCase(), "i")
      }
    }
    userCol.findOne(query, (err, user) => {
      //console.log(user)
      if (user) {
        res.json({
          "score": user.score
        })
      } else {
        res.json({
          "score": null
        })
      }
    });
    database.close();
  })
})

router.get('/registraion/availible/:username', (req, res) => {
  MongoClient.connect(url, (err, database) => {
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
    database.close();
  });
});


//TODO recheck if username unique
function addUser(userdata, callback) {
  MongoClient.connect(url, (err, database) => {
    let hashed_password = bcrypt.hashSync(userdata.password, 10);
    database.collection('users').insertOne({
      "username": userdata.username,
      "hashed_password": hashed_password,
      "score": 0,
      "create_date": new Date()
    }, () => {
      database.close();
    });
  });
}


router.post('/register', (req, res) => {
  //console.log(req.body);
  var userdata = req.body;
  addUser(userdata);
  res.json({
    "username": userdata.username
  });
});

function passwordMatchesHash(plainTextPassword, hash) {
  return bcrypt.compareSync(plainTextPassword, hash);
}
module.exports = router;

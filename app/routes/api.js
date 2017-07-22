var config = require('../data/config');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
var notifier = require('../modules/notifier');
var bodyParser = require('body-parser');
var sanitizer = require('sanitizer');
var dbName = "cosmosdb";
var dbpassword = config.password;
var postData = require('../data/posts.json');
var bodyParser = require('body-parser');
var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/' + dbName + '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
//var url = 'mongodb://adam:'+dbpassword+'@ds151702.mlab.com:51702/cosmosdb'
var datapost = null;
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

// // require the module
// const OneSignalClient = require('node-onesignal').default;

// // // create a new clinet
// const client = new OneSignalClient(config.oneSignalAppID, config.oneSignalRestAPIKey);

function getData(db, callback) {
  var posts = db.collection('posts');
  posts.find({
    "date": {
      $gte: (new Date((new Date()).getTime() - (48 * 60 * 60 * 1000)))
    }
  }).sort({
    "date": -1
  }).toArray((err, data) => {
    datapost = data
    db.close();
    callback();
  });
}

router.get('/api', function(req, res) {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    }
    console.log('connected successfully to database');

    getData(db, () => {
      var data = []
      datapost.forEach((item) => {
        var id = item._id
        var text = item.text_content;
        var username = item.username;
        var date = item.date;
        var fomatedTimeLeft = formatDate(date);
        var replies = [];

        var currentUserId = (req.session.user) ? req.session.user._id: null;
        var currentUserStar = item.likes.includes(currentUserId)? 1:0;
        var numberOfLikes = item.likes.length;
        if (item.replies)
          item.replies.forEach((reply) => {
            var minutes = Math.floor((new Date() - new Date(reply.date)) / (60 * 1000))
            replies.push({
              "text_content": reply.text_content,
              "username": reply.username,
              "time": minutes < 120 ? minutes + 'm ago' : Math.floor(minutes / 60) + 'h ago'
            })
          });
        data.push({
          "_id": id,
          "text_content": text,
          "username": username,
          "time": formatedTimeLeft,
          "replies": replies,
          "likes": numberOfLikes,
          "currentUserStarPost": currentUserStar,
          'OneSignalUserId':item.OneSignalUserId
        })
      });
      res.json(data)
    });
  });
});


function formatDate(date) {
  var currentDate = new Date();
  var msDate = currentDate - date;
  var limit = 1000 * 60 * 60 * 48;
  var timeLeft = limit - msDate;
  return formatedTimeLeft = msToTime(timeLeft);
}


function msToTime(msDate) {
  var milliseconds = parseInt((msDate % 1000) / 100);
  var seconds = parseInt((msDate / 1000) % 60);
  var minutes = parseInt((msDate / (1000 * 60)) % 60);
  var hours = parseInt((msDate / (1000 * 60 * 60)) % 48);

  hours = (hours < 10) ? hours : hours;
  minutes = (minutes < 10) ? minutes : minutes;

  if (hours < 1) {
    return minutes + 1 + " m remaining"
  } else {
    return hours + 1 + "h remaining "
  }
}

//add post to database
router.post('/api', function(req, res) {
  MongoClient.connect(url, (err, db) => {
    if (err) {
      console.log(err);
    }
    console.log('connected successfully to database');
    var posts = db.collection('posts');
    var data = req.body;
    var text = sanitizer.escape(data.text_content);
    var username = (req.session.user) ? req.session.user.username : null;
    posts.insert({
      'text_content': text,
      'username': username,
      'date': new Date(),
      'replies': [],
      'likes':[],
      'currentUserStarPost': 0,
      'OneSignalUserId':data.OneSignalUserId,
    }, (err, post)=>{
      res.json({
      "text_content": text,
      "username": username,
      "time": "48h remaining",
      "_id": post.insertedIds[0]
      });
    });
    db.close();
    if (username) {
      console.log('sending notification...')
      notifier.sendNotification('<h2>'+username +' just made a new Post!</h2>'+text)
    }
  })
});

router.post('/api/reply', function(req, res) {
  MongoClient.connect(url, (err, db) => {
    if (err)
      console.log(err);

    console.log(req.body)
    var posts = db.collection('posts');
    var data = req.body;
    var text = sanitizer.escape(data.text_content);
    var replyPostId = data.replypostid;
    var username = (req.session.user) ? req.session.user.username : null;
    var newReply = {
      'text_content': text,
      'username': username,
      'date': new Date()
    }
    posts.findOneAndUpdate({
      '_id': new ObjectId(replyPostId)
    }, {
      '$push': {
        "replies": newReply
      }
    },(err, data)=>{
      if(data.value.OneSignalUserId)
        notifier.sendNotification('Yo, someone replied to your post: '+text,data.value.OneSignalUserId);
    })
    db.close();
    res.json({
      "status": 200,
      "reply": newReply
    })
  })
});

router.post('/api/like', (req, res) => {
  MongoClient.connect(url, (err, db) => {
    if (!req.session.user) {
      res.status(401).send('please login')
    } else {
      var userId = req.session.user._id
      var postId = req.body.post_id
      var starStatus = req.body.starStatus
      var posts = db.collection('posts')
      var users = db.collection('users')
      if (starStatus == 1){
        posts.findOneAndUpdate({"_id": new ObjectId(postId)},
        {
          $addToSet: {
            "likes": userId
          }
        });
        res.status(200).send('liked!');
        db.close();
      }else{
        posts.update(
          { "_id" : new ObjectId(postId) },
            { $pull: {
              "likes":userId }
            });
        res.status(200).send('unliked!');
        db.close();
      }
    }
  })
})


module.exports = router;

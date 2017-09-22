var config = require('../data/config');
var forEach = require('co-foreach');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
var notifier = require('../modules/notifier');
var bodyParser = require('body-parser');
var sanitizer = require('sanitizer');
var dbName = "cosmosdb";
var dbpassword = config.password;
var bodyParser = require('body-parser');
var badges = require('../data/badges.json')
var url = 'mongodb://cosmos:' + dbpassword + '@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/' + dbName + '?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));
// // require the module
// const OneSignalClient = require('node-onesignal').default;

// // // create a new clinet
// const client = new OneSignalClient(config.oneSignalAppID, config.oneSignalRestAPIKey);

router.get('/api', function(req, res) {
  MongoClient.connect(url, (err, db) => {
    if (err) {

    }
    console.log('connected successfully to database');

    var posts = db.collection('posts');
    var users = db.collection('users');

    //find by 42 hours
    var x = (new Date((new Date()).getTime() - (42 * 60 * 60 * 1000)))
    posts.aggregate([{
      "$redact": {
        "$cond": {
          "if": {
            "$gt": [{
                "$add": ["$date", {
                  "$multiply": [{
                    $size: "$likes"
                  }, 60 * 60]
                }]
              },
              (new Date((new Date()).getTime() - (42 * 60 * 60 * 1000)))
            ]
          },
          "then": "$$KEEP",
          "else": "$$PRUNE"
        }
      }
    }]).sort({
      "date": -1
    }).toArray((err, datapost) => {
      if (err) {

      }
      //go through make each post
      var data = [];
      if (datapost.length > 0) {
        var lastPostElement = datapost.length - 1;
        datapost.forEach((item, postIndex) => {
          var id = item._id
          var text = item.text_content;
          var username = item.username;
          var date = item.date;
          var replies = [];
          var currentUserId = (req.session.user) ? req.session.user._id : null;
          var currentUserStar = item.likes.includes(currentUserId) ? 1 : 0;
          var numberOfLikes = item.likes.length;
          var userScore;
          //Creates an array of replies
          var lastReplyElement = item.replies.length - 1;
          //TODO Fix code duplication
          users.findOne({
            "username": username,
          }, (err, user) => {
            userScore = (user) ? user.score : null;
            userBadge = (user) ? user.active_badge : null;
            officialAccount = (user) ? user.official : null;
            data.push({
              "_id": id,
              "text_content": text,
              "username": username,
              "userBadge": userBadge,
              "time": formatedDate(item.date),
              "replies": item.replies,
              "officialAccount": officialAccount,
              "score": userScore,
              "likes": numberOfLikes,
              "currentUserStarPost": currentUserStar,
              'OneSignalUserId': item.OneSignalUserId
            })
            if (postIndex == lastPostElement) {
              res.json(data)
              db.close()
            }
          })
        })

        function updateData(d) {
          data = d;
        }
      } else {
        res.json(data)
        db.close()
      }

    });
  });
});

function formatedDate(date) {
  var unixPostTime = date.getTime()
  var unixTimeDiff = new Date().getTime() - date.getTime()
  var hoursRemaing = 42 - unixTimeDiff / (1000 * 60 * 60)
  if (hoursRemaing >= 1) {
    return Math.ceil(hoursRemaing) + "h remaining"
  } else {
    var minsRemaing = (42 * 60) - unixTimeDiff / (1000 * 60 * 60)
    return (Math.ceil(minsRemaing) - unixTimeDiff / (1000 * 60)) + "m remaining"
  }
}


function msToTime(msDate) {
  var milliseconds = parseInt((msDate % 1000) / 100);
  var seconds = parseInt((msDate / 1000) % 60);
  var minutes = parseInt((msDate / (1000 * 60)) % 60);
  var hours = parseInt((msDate / (1000 * 60 * 60)) % 42);

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
  if (req.body.text_content.length > 500) {
    res.status(413).send("Illegal post request")
    return
  } else {
    MongoClient.connect(url, (err, db) => {
      if (err) {

      }


      var posts = db.collection('posts');
      var data = req.body;
      var text = sanitizer.escape(data.text_content);
      var username = (req.session.user) ? req.session.user.username : null;
      //Finds array of posts poster has made in the last 10 minutes
      posts.find({
        $and: [{
          "username": username
        }, {
          "date": {
            "$gt": (new Date((new Date()).getTime() - (1000 * 60 * 10)))
          }
        }]
      }).toArray(function(err, postsInLast5mins) {
        //If the user has posted twice in the past 10 minutes already an error is thrown
        if (username && postsInLast5mins.length >= 2) {
          res.status(429).send("Too many posts")
          console.log("Too many post requests by user:" + username);
          db.close();
        } else {
          //Removes username if post is specified to be anonymous
          //TODO cast data.anon as bool
          if(data.anon==='true')
            username=null;
          posts.insert({
            'text_content': text,
            'username':username,
            'date': new Date(),
            'replies': [],
            'likes': [],
            'currentUserStarPost': 0,
            'OneSignalUserId': data.OneSignalUserId,
          }, (err, post) => {

            res.json({
              "text_content": text,
              "username": username,
              "userBadge": (req.session.user) ? req.session.user.active_badge : null,
              "score": (req.session.user) ? req.session.user.score : null,
              "time": "42h remaining",
              "_id": post.insertedIds[0]
            });
            db.close();
          });
        }
      });


      if (username) {
        console.log('sending notification...')
        notifier.sendNotification('<h2>' + username + ' just made a new Post!</h2>' + text)
      }
    })
  }
});

router.post('/api/reply', function(req, res) {
  if (req.body.text_content.length > 500) {
    res.status(413).send("Illegal post request")
    return
  } else {
    MongoClient.connect(url, (err, db) => {
      if (err)
        console.log(err);

      var posts = db.collection('posts');
      var data = req.body;
      var text = sanitizer.escape(data.text_content);
      var replyPostId = data.replypostid;
      var username = (req.session.user) ? req.session.user.username : null;
      var badge = (req.session.user) ? req.session.user.active_badge : null;
      var newReply = {
        'text_content': text,
        'username': username,
        'date': new Date(),
        'badge': badge
      }
      posts.findOneAndUpdate({
        '_id': new ObjectId(replyPostId)
      }, {
        '$push': {
          "replies": newReply
        }
      }, (err, data) => {
        if (data.value.OneSignalUserId)
          notifier.sendNotification('Yo, someone replied to your post: ' + text, data.value.OneSignalUserId);
      })
      db.close();
      res.json({
        "status": 200,
        "reply": newReply
      })
    })
  }
});

router.post('/api/like', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('please login');
  }
  MongoClient.connect(url, (err, db) => {
    if (!req.session.user) {
      res.status(401).send('please login')
    } else {
      var userId = req.session.user._id
      var postId = req.body.post_id
      var starStatus = req.body.starStatus
      var posts = db.collection('posts')
      var users = db.collection('users')

      //Liking post
      if (starStatus == 1) {
        //increments post score
        posts.findOneAndUpdate({
          "_id": new ObjectId(postId)
        }, {
          $addToSet: {
            "likes": userId
          }
        }, (err, post) => {
          if (err) {
            res.status(500).send('unable to like');
            db.close();
            return
          }
          var posterUsername = post.value.username
          //Increments poster score
          //TODO not finding user
          users.findOneAndUpdate({
            "username": posterUsername
          }, {
            $inc: {
              "score": 1
            }
          }, (err, posterData) => {
            if (err) {
              res.status(500).send(err);
              db.close();
              return
            }

            //Checks if poster unlocked a new badge
            badgeUnlocked(posterData.value)
            res.status(200).send('liked!');
            db.close();
          })
        });
        //Returns ajax call
      } else {
        //unliking post
        //Decrements posts likes
        posts.findOneAndUpdate({
          "_id": new ObjectId(postId)
        }, {
          $pull: {
            "likes": userId
          }
        }, (err, postData) => {
          if (err) {
            res.status(500).send('unable to unlike');
            db.close();
            return
          }
          //Decrements posters score
          var posterUsername = postData.value.username
          users.findOneAndUpdate({
            "username": posterUsername
          }, {
            $inc: {
              "score": -1
            }
          }, (err, posterData) => {
            if (err) {
              res.status(500).send('unable to like');
              db.close();
              return
            }
            res.status(200).send('unliked!');
            db.close();
          })
        })
      }
    }
  })
})

function badgeUnlocked(user) {
  if (user == null)
    return
  var unlockedBadges = [];
  //+1 for the like they just recieved
  if (!user.badges && user.badges.indexOf(badges[0]) < 0)
    unlockedBadges.push(badges[0])
  if (user.score + 1 >= 5 && user.badges.indexOf(badges[1]) < 0)
    unlockedBadges.push(badges[1])
  if (user.score + 1 >= 10 && user.badges.indexOf(badges[2]) < 0)
    unlockedBadges.push(badges[2])
  if (user.score + 1 >= 15 && user.badges.indexOf(badges[3]) < 0)
    unlockedBadges.push(badges[3])
  if (user.score + 1 >= 30 && user.badges.indexOf(badges[4]) < 0)
    unlockedBadges.push(badges[4])
  if (user.score + 1 >= 30 && user.badges.indexOf(badges[5]) < 0)
    unlockedBadges.push(badges[5])
  if (user.score + 1 >= 45 && user.badges.indexOf(badges[6]) < 0)
    unlockedBadges.push(badges[6])
  if (user.score + 1 >= 60 && user.badges.indexOf(badges[7]) < 0)
    unlockedBadges.push(badges[7])
  if (user.score + 1 >= 75 && user.badges.indexOf(badges[8]) < 0)
    unlockedBadges.push(badges[8])
  if (user.score + 1 >= 90 && user.badges.indexOf(badges[9]) < 0)
    unlockedBadges.push(badges[9])
  if (user.score + 1 >= 100 && user.badges.indexOf(badges[10]) < 0)
    unlockedBadges.push(badges[19])
  if (user.score + 1 >= 115 && user.badges.indexOf(badges[11]) < 0)
    unlockedBadges.push(badges[11])
  if (unlockedBadges) {
    MongoClient.connect(url, (err, db) => {
      db.collection('users').findOneAndUpdate({
        '_id': new ObjectId(user._id)
      }, {
        $addToSet: {
          "badges": {
            $each: unlockedBadges
          }
        }
      }, (err, user) => {
        console.log("unlocked a new badge!");
        db.close();
      })
    })
  }
}


module.exports = router;

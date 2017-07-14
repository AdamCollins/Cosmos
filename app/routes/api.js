var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));
var config = require('../data/config');
var dbName = "cosmosdb";
var dbpassword = config.password;
var postData = require('../data/posts.json');
var bodyParser = require('body-parser');
var db = null;
var url = 'mongodb://cosmos:'+dbpassword+'@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/'+dbName+'?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
//var url = 'mongodb://adam:'+dbpassword+'@ds151702.mlab.com:51702/cosmosdb'
var datapost = null;

MongoClient.connect(url, function(err, database){
  if(err){
    console.log(err);
  }

  console.log('connected successfully to database'); 
  db = database;

  //load all the existing posts within the last 48 hours
  getData(function(){
    db.close();
  });
});


function getData(callback){
  var posts = db.collection('posts');
  posts.find({
    "date":
    {
      $gte:(new Date((new Date()).getTime()-(48 * 60 * 60 * 1000)))
    }
  }).sort({ "date": -1 }).toArray(function(err, data){
    datapost = data
    callback
  });
}



router.get('/api',function(req, res){
  getData(function(){
    db.close();
  });

  //console.log(datapost)
  var data = []
  datapost.forEach(function(item){
    //console.log(item)
    var id = item._id
    var text = item.text_content;
    var username = item.username;
    var date = item.date;
    var fomatedTimeLeft = formatDate(date)
    data.push({"_id":id, "text_content": text, "username": username, "time":formatedTimeLeft})
  });
  res.json(data)
});

function formatDate(date){
  var currentDate = new Date();
  var msDate = currentDate - date;
  var limit = 1000*60*60*48;
  var timeLeft = limit - msDate;
  return formatedTimeLeft = msToTime(timeLeft);
}


function msToTime(msDate) {
  var milliseconds = parseInt((msDate%1000)/100);
  var seconds = parseInt((msDate/1000)%60);
  var minutes = parseInt((msDate/(1000*60))%60);
  var hours = parseInt((msDate/(1000*60*60))%48);

  hours = (hours < 10) ? hours : hours;
  minutes = (minutes < 10) ? minutes : minutes;
 
  if (hours < 1){
    return  minutes + 1 + " m remaining"
  }else{
    return hours + 1 + "h remaining "
  }
}



//add post to database
router.post('/api',function(req,res){
  var posts = db.collection('posts');
  var data = req.body;
  var post = data.text;
  var username = data.poster;
  posts.insert({
    'text_content':post,
    'username':username,
    'date': new Date()
  });
  db.close();
});



module.exports = router;



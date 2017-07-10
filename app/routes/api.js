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
var db = null
var url = 'mongodb://cosmos:'+dbpassword+'@cluster0-shard-00-00-oe5ks.mongodb.net:27017,cluster0-shard-00-01-oe5ks.mongodb.net:27017,cluster0-shard-00-02-oe5ks.mongodb.net:27017/'+dbName+'?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
//var url = 'mongodb://adam:'+dbpassword+'@ds151702.mlab.com:51702/cosmosdb'


MongoClient.connect(url, function(err, database){
  if(err){
    console.log(err);
  }
  console.log('connected successfully to database'); 
  db = database

  //load all the existing posts within the last 48 hours
  getData(function(){
    db.close()
  })
});


function getData(callback){
  var posts = db.collection('posts');
  posts.find({
    "date":
    {
      $gte:(new Date((new Date()).getTime()-(15 * 48 * 60 * 60 * 1000)))
    }
  }).sort({ "date": -1 }).toArray(function(err, docs){
    console.log(docs)
    callback
  });
}





// router.get('/api',function(req, res){
  

// });


//add post to database
router.post('/api',function(req,res){
  var posts = db.collection('posts');
  var data = req.body;
  var post = data.text;
  var username = data.poster;
  posts.insert({
    'text_content':post, 
    'username':username, 
    'date': new Date()})
  db.close();
});



module.exports = router;





// function getRecentPosts(db, callback){
//   var recentPosts = '';
//   var collection = db.collection('posts');
//   collection.find().sort({'date':-1}).toArray((err,doc)=>{
//     console.log(doc); //TODO return doc when function called
//     callback
//   });
//   return recentPosts;
// }




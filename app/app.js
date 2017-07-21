var express = require('express');
var reload = require('reload');
var https = require('https');
var fs = require('fs');
var app = express();
var postData = require('./data/posts.json');
var session = require('express-session');
var port = process.env.PORT || 3000;
var httpsOptions = {
  ca: fs.readFileSync("./ssl/bundle.crt"),
  key: fs.readFileSync("./ssl/gocosmos.key"),
  cert: fs.readFileSync("./ssl/gocosmos.crt")
};
app.set('port',port);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/api'));
app.use(require('./routes/login'));
// app.use(require('./modules/notifications'));
// app.use(require('./routes/notifications'));
app.use(session({
  secret: "asdfghjhrgtygf4etr23retfgcnvhmKJHJGHJKm",
  resave: false,
  saveUninitialized: true
}));

var port = app.get('port')
var server = https.createServer(httpsOptions, app).listen(443, function(){
  console.log('listening securely on port 443');
});

reload(server,app);

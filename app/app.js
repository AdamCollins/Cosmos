var express = require('express');
var reload = require('reload');
var app = express();
var postData = require('./data/posts.json');
var session = require('express-session');

app.set('port',3000);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/api'));
app.use(require('./routes/login'));
app.use(require('./routes/notifications'));
app.use(session({
  secret: "asdfghjhrgtygf4etr23retfgcnvhmKJHJGHJKm",
  resave: false,
  saveUninitialized: true
}));

var port = app.get('port')
var server = app.listen(port, function(){
  console.log('listening on port ' + port);
});

reload(server,app);

var express = require('express');
var reload = require('reload');
var app = express();
var postData = require('./data/posts.json');

app.set('port',3000);
app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/api'));

app.set('view engine', 'ejs');
app.set('views', 'app/views');


var server = app.listen(app.get('port'), function(){
  console.log('listening on port ' + app.get('port'));
});

reload(server,app);

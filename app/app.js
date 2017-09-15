const HTTPSENABLED = process.argv[2]==='-https';
var DEVMODE = !HTTPSENABLED;
var express = require('express');
var reload = require('reload');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var port = process.env.PORT || 3000;
if (HTTPSENABLED)
  var httpsOptions = {
    ca: fs.readFileSync("./ssl/bundle.crt"),
    key: fs.readFileSync("./ssl/gocosmos.key"),
    cert: fs.readFileSync("./ssl/gocosmos.crt")
  };
app.set('port', port);
app.set('view engine', 'ejs');
app.set('views', 'app/views');
app.set('DEVMODE',DEVMODE);

app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/api'));
app.use(require('./routes/users'));
app.use(require('./routes/tos'))
app.use(require('./routes/robots'))
app.use(require('./routes/sitemap'))
// app.use(require('./modules/notifications'));
// app.use(require('./routes/notifications'));


var port = app.get('port')
var server = null;
if (HTTPSENABLED) {
  //Redirects to https
  http.createServer(function(req, res) {
    res.writeHead(301, {
      "Location": "https://" + req.headers['host'] + req.url
    });

    res.end();
  }).listen(80);
  server = https.createServer(httpsOptions, app).listen(443, function() {
    console.log('listening securely on port 443');
  });
} else {
  server = app.listen(3000, () => {
    console.log('HTTPS DISABLED: listening on port 3000');
  })
}
reload(server, app);

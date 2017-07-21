var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var config = require('../data/config');
var nodemailer = require('nodemailer');
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
  },
  secret: "asdfghjhrgtygf4etr23retfgcnvhmKJHJGHJKm",
  resave: false,
  saveUninitialized: true
}));

router.post('/login', (req, res) => {
  MongoClient.connect(url, (err, database) => {
    var userCol = database.collection('users');
    console.log(req.body.username)
    userCol.findOne({
      "username": {
        $regex: new RegExp("^" + req.body.username.toLowerCase(), "i")
      }
    }, function(err, user) {
      console.log(user)
      if (user) {
        console.log(req.body);
        console.log(user);
        console.log(3)
        if (passwordMatchesHash(req.body.password, user.hashed_password)) {
          if (user.verified) {
            req.session.user = user;
            req.session.save();
            console.log('logged ' + req.session.user.username + ' successfully!');
            res.status(200).send('Login successfully');
          } else {
            res.status(403).send('Unverified');
          }
        } else {
          console.log('1log');
          res.status(401).send('Invalid login');
        }
      } else {
        console.log('2log');
        res.status(401).send('Invalid login');
      }
    });
    database.close();
  });
});








router.get('/listusers', (req, res) => {
  console.log()
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
      console.log(user)
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
          "username_exists": true,
          "verified": docs.verified
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
    //Creates high entropy unique websafe code for email verification
    let verificationCode = (Math.random() * 1e32).toString(36);
    database.collection('users').insertOne({
      "username": userdata.username,
      "hashed_password": hashed_password,
      "score": 0,
      "create_date": new Date(),
      "verified": false,
      "verification_code": verificationCode
    }, () => {
      sendVerificationEmail(userdata.email, userdata.username, verificationCode)
    });
    database.close();
  });
}

function sendVerificationEmail(recipient, username, verificationCode) {
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'gocosmosxyz@gmail.com',
      pass: config.password
    }
  });
  var verificationLink = 'localhost:3000/register/accountverify/' + verificationCode;
  console.log("recipient:" + recipient)
  var mailOptions = {
    from: '"Cosmos Team 🚀"<gocosmosxyz@gmail.com>',
    to: recipient,
    subject: 'Account verification',
    html: generateEmail(username, verificationCode)
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}


router.get('/register/accountverify/:verificationCode', (req, res) => {
  MongoClient.connect(url, (err, database) => {
    console.log(req.params.verificationCode)
    database.collection('users').findOne({
      "vverification_code": req.params.verificationCode
    }, function(err, user) {
      console.log(user)
    });
    database.collection('users').updateOne({
      "verification_code": req.params.verificationCode
    }, {
      $set: {
        verified: true
      }
    })
  });
  res.send('Thank you for verifying')
});

router.post('/register', (req, res) => {
  console.log(req.body);
  var userdata = req.body;
  addUser(userdata);
  res.json({
    "username": userdata.username
  });
});

function passwordMatchesHash(plainTextPassword, hash) {
  return bcrypt.compareSync(plainTextPassword, hash);
}

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successfully');
});

function generateEmail(username, verificationCode) {
  var verificationLink = 'http://gocosmos.xyz/register/accountverify/' + verificationCode;
  return `
  <html>
  <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">

  </head>

  <body style="background: #539987;">
    <div style="background-color:#539987;">
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background: #539987;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#539987;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:20px 0px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:10px 25px;" align="center">
                          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:80px;"><a href="about:blank" target="_blank"><img alt="auth0" title="" height="auto" src="https://raw.githubusercontent.com/AdamCollins/Cosmos/master/logo.png" style="border:none;border-radius: 10px;display:block;outline:none;text-decoration:none;width:100%;height:auto;background-color: #615756;" width="80"></a></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background:#222228;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#615756;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:20px 0px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:480px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-80" class="mj-column-per-80" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:10px 25px;padding-top:30px;" align="center">
                          <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="width:80px;"><img alt="Zero To Launch" title="" height="auto" src="https://cdn.auth0.com/website/emails/product/top-verify.png" style="border:none;border-radius:;display:block;outline:none;text-decoration:none;width:100%;height:auto;"
                                    width="80"></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 20px 0px 20px;" align="center">
                          <div style="cursor:auto;color: #52ffb8;font-family:'Avenir Next', Avenir, sans-serif;font-size:32px;font-weight: bold;line-height:60ps;">Welcome to Cosmos! 🚀 </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background: #539987;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#539987;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:40px 25px 0px;color: white;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;color: white;padding:0px 0px 25px;" align="left">
                          <div style="cursor:auto;color: #ffffff;font-family:'Avenir Next', Avenir, sans-serif;font-size:18px;font-weight:500;line-height:30px;">
                            Your account information
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td><td style="vertical-align:top;width:180px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-30" class="mj-column-per-30" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                          <div style="cursor:auto;color: #ffffff;font-family:'Avenir Next', Avenir, sans-serif;font-size:16px;line-height:30px;">
                            <strong style="font-weight: 500; white-space: nowrap;">Account</strong>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td><td style="vertical-align:top;width:420px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-70" class="mj-column-per-70" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                          <div style="cursor:auto;color: #ffffff;font-family:'Avenir Next', Avenir, sans-serif;font-size:16px;line-height:30px;">
                            ` + username + `
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td><td style="vertical-align:top;width:180px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-30" class="mj-column-per-30" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 10px;" align="left">
                          <div style="cursor:auto;color: #ffffff;font-family:'Avenir Next', Avenir, sans-serif;font-size:16px;line-height:30px;">
                            <strong style="font-weight: 500; white-space: nowrap;">Verify Link</strong>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td><td style="vertical-align:top;width:420px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-70" class="mj-column-per-70" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 25px;" align="left">
                          <div style="cursor:auto;color:#222228;font-family:'Avenir Next', Avenir, sans-serif;font-size:16px;line-height:30px;">
                            <a href="` + verificationLink + `" style="color: #52ffb8;text-decoration:none;" target="_blank">` + verificationLink + `</a>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background: #539987;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background: #539987;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:0px 30px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:undefined;width:600px;">
        <![endif]-->
                <p style="font-size:1px;margin:0 auto;border-top:1px solid #E3E5E7;width:100%;"></p>
                <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="font-size:1px;margin:0 auto;border-top:1px solid #E3E5E7;width:100%;" width="600"><tr><td style="height:0;line-height:0;">&nbsp;</td></tr></table><![endif]-->
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background: #539987;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background: #539987;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:20px 0px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:10px 25px;" align="center">
                          <table cellpadding="0" cellspacing="0" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="border-radius:3px;color:white;cursor:auto;" align="center" valign="middle" bgcolor="#EB5424"><a href="` + verificationLink + `" style="display:inline-block;text-decoration:none;background: #52FFB8;border-radius:3px;color: #615756;font-family:'Avenir Next', Avenir, sans-serif;font-size:14px;font-weight:500;line-height:35px;padding:10px 25px;margin:0px;font-weight: bold;"
                                    target="_blank">
              VERIFY YOUR ACCOUNT
            </a></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background: #539987;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background: #539987;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:20px 0px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 25px 15px;" align="left">
                          <div style="cursor:auto;color: #ffffff;font-family:'Avenir Next', Avenir, sans-serif;font-size:16px;line-height:30px;">Thank you for registering. Now, Go Explore!</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div style="margin:0 auto;max-width:600px;background:#F5F7F9;">
        <table cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#F5F7F9;" align="center" border="0">
          <tbody style="
      background: #615756;
  ">
            <tr>
              <td style="text-align:center;vertical-align:top;font-size:0px;padding:20px 0px;">
                <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0"><tr><td style="vertical-align:top;width:600px;">
        <![endif]-->
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%;">
                  <table cellpadding="0" cellspacing="0" style="vertical-align:top;" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 20px;" align="center">
                          <div style="cursor:auto;color: #52ffb8;font-family:'Avenir Next', Avenir, sans-serif;font-size:13px;line-height:20px;">
                            If you have any inquires on questions please direct contact us at: adamcollins6@gmail.com
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
      <!--[if mso | IE]>
        <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      <div></div>
      <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
    </div>



  </body>

  </html>`
}


module.exports = router;

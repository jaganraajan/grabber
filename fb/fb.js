const express = require('express');


const graph     = require('fbgraph');

var app = express(); 

var server = require("http").createServer(app);


// this should really be in a config file!
var conf = {
    client_id:      '492093831452257'
  , client_secret:  '5683e64717e7695ca4bcfe5b2cde11a8'
  , scope:          'read_insights'
  // You have to set http://localhost:3000/ as your website
  // using Settings -> Add platform -> Website
  , redirect_uri:   'http://localhost:3000/auth'
};


// Configuration
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

app.set('views', __dirname + '/views');
// Jade was renamed to pug
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

var path = require ('path');
app.use(express.static(path.join(__dirname, '/public')));

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

// Routes

app.get('/', function(req, res){
  res.render("index", { title: "click link to connect" });
});

app.get('/auth', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    console.log("Performing oauth for some user right now.");
  
    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
  }
  // If this branch executes user is already being redirected back with 
  // code (whatever that is)
  else {
    console.log("Oauth successful, the code (whatever it is) is: ", req.query.code);
    // code is set
    // we'll send that and get the access token
    graph.authorize({
        "client_id":      conf.client_id
      , "redirect_uri":   conf.redirect_uri
      , "client_secret":  conf.client_secret
      , "code":           req.query.code
    }, function (err, facebookRes) {
      console.log('response: ',facebookRes.access_token);
    });
  }
});


// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function(req, res) {
  res.render("index", { 
      title: "Logged In" 
  });
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Express server listening on port %d", port);
});
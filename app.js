/**
 * Module dependencies.
 */

// base dependencies for app ----------------------------------------------------
var express = require("express");
var routes = require("./routes/routes");
var http = require("http");
var path = require("path");
var util = require("util");

var connect = require('connect');

var passport = require('passport');
var mongoose = require('mongoose');

var request = require('request');

// node-validator
var expressValidator = require('express-validator');

// app config -------------------------------------------------------------------
var app = module.exports = express();

// Session store | Redis --------------------------------------------------------
var clientOption = {};
/* Only use in production environment */
// if ('production' == app.get('env')) {
//   var redis = require('redis');
//   var client = redis.createClient(6379, 'nodejitsudb6896392833.redis.irstack.com');
//   client.on("error", function (err) {
//         console.log("Error " + err);
//     });

//   clientOption = {
//       client: client
//     };
//   client.auth('nodejitsudb6896392833.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function(err) {
//     if (err) {
//       throw err;
//     }
//     // You are now connected to your redis.
//     console.log("connected to redis");
//   });
// }

// var RedisStore = require('connect-redis')(express);
// var sessionStore = new RedisStore(clientOption);

// Database | MongoDB -----------------------------------------------------------
var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
var uri = "mongodb://localhost/koth"
if ('production' == app.get('env')) {
  uri = 'mongodb://nodejitsu_nickpoorman:3q04aooonejlm0f3u7s8s2vnl6@ds051977.mongolab.com:51977/nodejitsu_nickpoorman_nodejitsudb4365124867';
}
//var conn = mongoose.createConnection(uri, {server:{poolSize:2}}); // this doesn't seem to be working
mongoose.connect(uri);
mongoose.connection.on("open", function() {
  console.log(__filename + ": We have connected to mongodb");
});
mongoose.connection.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});

// Passport | config -----------------------------------------------------------
// dependencies for authentication
// var passport = require('passport') , FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./models/user');

// Define facebook strategy for Passport
// passport.use(new FacebookStrategy({
//     clientID: "133576740159468",
//     clientSecret: "73e35cc2af835859ce2c1938b4079d0a",
//     callbackURL: "http://www.example.com/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));
// serialize user on login
//passport.serializeUser(function(user, done) {
//  done(null, user.id);
//});

// deserialize user on logout / session lookup?
//passport.deserializeUser(function(id, done) {
//  User.findById(id, function(err, user) {
//    done(err, user);
//  });
//});

// All | config -----------------------------------------------------------
// config - all environments
app.set('port', process.env.PORT || 80);
app.set("views", __dirname + "/views");
//app.set('view engine', 'hbs');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/assets/ico/favicon.ico'));
app.use(express.logger('dev'));
// Compress response data with gzip / deflate.
app.use(express.compress());
/*
    http://tjholowaychuk.com/post/18418627138/connect-2-0
    TODO: refactor? for Connect 2.0
    The cookieParser() middleware now supports signed cookies,
    and accepts a secret. This replaces the need to pass
    session({ secret: string }) to the session() middleware.
    Signed cookies are available via req.signedCookies, and
    unsigned as req.cookies.
    */
app.use(express.cookieParser("acookienonce"));
app.use(express.bodyParser());
app.use(expressValidator);
app.use(express.methodOverride());
// app.use(express.session({
//  store: sessionStore
// }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions.
// app.use(passport.initialize());
// app.use(passport.session());
// create our own middleare here
app.use(function(req, res, next) {
  // need to use request to hit the server
  var accessToken = req.param('access_token');
  if (!accessToken) {
    //console.log("no access token");
    return next();
  }

  var uri = 'https://graph.facebook.com/me?access_token=' + accessToken;
  request(uri, function(error, response, body) {
    console.log("body: ");
    console.log(body);
    if (!error && response.statusCode == 200) {
      // console.log("calling findOrCreate");
      return User.findOrCreate(JSON.parse(body), function(err, user) {
        console.log("error is: ");
        console.log(err);
        console.log("user is: ");
        console.log(user);
        if (err) return res.json(400, {
          message: "DB auth error"
        });
        req.user = user;
        req.oAuth = body;
        return next();
      });
    }
    if (typeof response.error !== "undefined") {
      // then the user token probably expired
      return res.json(400, {
        message: "expired token"
      });
    }
    return res.json(400, {
      message: "unknown error, probably oAuth"
    });
  })
});

app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals.session = req.session;
  res.locals.title = "King of the Hill &middot; HackUpstate";
  res.locals.nav = '';
  next();
});
app.use(app.router);
app.use(express.static('public'));

// config - development
//if('development' == app.get('env')) {
app.use(express.errorHandler());
//}

console.log("Environment: " + app.settings.env);
console.log("app.get('env'): " + app.get('env'));

// routes -----------------------------------------------------------------------
require('./routes/routes')(app);


// The 404 Route (ALWAYS Keep this as the last route)
// app.get "*path", (req, res) ->  
//  if the resource is not found then forward to backbone's router
// app.use(function(req, res) {
//   var newUrl;
//   newUrl = req.protocol + '://' + req.get('Host') + '/#' + req.url;
//   return res.redirect(307, newUrl);
// });
// server -----------------------------------------------------------------------
http.createServer(app).listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
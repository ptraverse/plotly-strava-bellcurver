var http = require('http');
var path = require('path');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var passport = require('passport');
var StravaStrategy = require('passport-strava-oauth2').Strategy;
var router = express();
var server = http.createServer(router);
var request = require('request');
var app = express.createServer();
var strava = require('strava-v3');
var _ = require('lodash');

const STRAVA_CLIENT_ID = 13234;
const STRAVA_CLIENT_SECRET = 'f7ff13f2589f3afe2eec509782e5dcdc3bbf5e0d'; 
const STRAVA_CALLBACK_URL = "https://plotly-strava-bellcurver-ptraverse.c9users.io/auth/strava/callback";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new StravaStrategy({
    clientID: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    callbackURL: STRAVA_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Strava profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Strava account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




// configure Express
app.configure(function() {
  app.set('views', __dirname + '/client/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  
  
  app.use(express.static(__dirname + '/client'));
});

app.get('/auth/strava',
  passport.authenticate('strava', { scope: ['public'] }),
  function(req, res){
    // The request will be redirected to Strava for authentication, so this
    // function will not be called.
  });

app.get('/account', ensureAuthenticated, function(req, res){
  console.log(req);
  res.render('account', { user: req.user });
});

app.get('/bellcurver', ensureAuthenticated, function(req, res) {
  res.render('bellcurver', { user: req.user });
});

app.get('/bellcurve/effort/:id', ensureAuthenticated, function(req, res) {
  
  //get matching effort
  var effortUrl = 'https://www.strava.com/api/v3/segment_efforts/' + req.params.id;
  request.get(effortUrl, {
    'auth': {
      'bearer': req.user.token
    }
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var matchedEffort = JSON.parse(body);
    }
    
    //get matching segment GET https://www.strava.com/api/v3/segments/:id/all_efforts
    var segmentId = matchedEffort.segment.id;
    var segmentUrl = 'https://www.strava.com/api/v3/segments/' +  segmentId + '/all_efforts'
    segmentUrl += '?per_page=100'
    request.get(segmentUrl, {
      'auth': {
        'bearer': req.user.token
      }
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var matchedEffortsList = JSON.parse(body);
      } else {
        var matchedEffortsList = response;
      }
      
      var matchedEffortsTimes = _(matchedEffortsList).map(e => e.elapsed_time);
      
      var effortObj = { 
        "effortId": req.params.id,
        "matchedEffort": matchedEffort,
        "matchedEffortsListLength": matchedEffortsList.length,
        // "matchedEffortsList": matchedEffortsList
        "matchedEffortsTimes": matchedEffortsTimes
      };
        
      res.render('effort', { effort: effortObj});
      
    });
  });
});

// GET /auth/strava/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/strava/callback', 
  passport.authenticate('strava', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("App Listening on Port " + addr);
});

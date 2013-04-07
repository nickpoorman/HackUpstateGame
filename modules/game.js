var debug = true;
var path = require("path");
var express = require("express");
var forms = require('forms'),
  fields = forms.fields,
  validators = forms.validators;

var _ = require('underscore');
var passport = require("passport");

var User = require('../models/user');
var Point = require('../models/point');

var battlePoints = require('./battlePoints');

var app = module.exports = express();
var viewPath = path.resolve(__dirname, '..', 'views');
app.set("views", viewPath);
app.set('view engine', 'jade');

// require auth token
app.get('/numPoints', getNumPoints);

app.get('/getHill', getHill);

// require // auth_token
app.get('/checkin/:numPoints', caputreHill);

app.get('/leaderboard', getLeaderboard);

// need a resource to add a hill?

function getNumPoints(req, res, next) {
  // get => /numPoints/:userID
  // load the user
  if (!user) {
    return res.json(400, {
      message: "not authed"
    });
  }

  return res.json({
    numPoints: user.numPoints
  });
}

function getHill(req, res, next) {
  // get => /getHill
  // return the only hill we have right now
  Point.findOne({
    key: 0
  }, function(err, point) {
    if (err) {
      return res.json(400, {
        message: "could not find hill"
      });
    }
    return res.json({
      cord: point.geo
    });
  });
}

function caputreHill(req, res, next) {
  // post => /checkin/:userID/:numPoints

  // first check to make sure they have the number of points they say they need
  if (!user) {
    return res.json(400, {
      message: "not authed"
    });
  }

  if (user.numPoints < req.param("numPoints")) {
    return res.json(400, {
      message: "insufficient points"
    });
  }

  // when a user capture's the hill we have to subtract that number of points from the user, ...do upsert and forget
  var yourBattlePoints = req.param("numPoints");
  user.numPoints = user.numPoints - yourBattlePoints;
  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        console.log("some error");
        return res.send(400);
      }
      console.log("[NEED-VALIDATION.signup] " + err);
      return res.send(400);
    }

    // save was successful
    // then we have to call the function to determine the person who wins,
    // then return a message on who won
    // the other guy won

    // need to get the guy who is currently on the hill
    Point.findOne({
      key: 0
    }, function(err, point) {
      if (err) {
        return res.json(400, {
          message: "could not find hill"
        });
      }
      // get the king on the hill now
      var king = point.king;
      // if the king has no points then you win!
      var lost = {
        winner: 0,
        remaining: yourBattlePoints
      };
      var message = "win";

      if (typeof king !== "undefined" && king.points) {
        // once we have the king, then battle him against you with the number of battle points you submitted
        // lost will be 0 if you win, or 1 if you lost
        lost = battlePoints(yourBattlePoints, king.points);
        message = lost.winner ? "loose" : "win";
      }

      if (!lost.winner) {
        // you won!
        // only add them as a capture if they win?
        // need to add a record to the hill to keep track that the user captured
        // update the record ...push object to hill
        // also set the new king with their remaining points
        point.captures.push({
          user: user,
          time: new Data()
        });
        point.king.points = lost.remaining;

        point.save(function(err) {
          if (err) {
            return res.json(400, "DB ERROR");
          }
          return req.json({
            message: message,
            postBattlePoints: lost.remaining
          });
        });
      }
    });
  });
}

function getLeaderboard(req, res, next) {
  // get => /leaderboard
  // this should return an object of all the users on the hill
  return res.json(200);
}


// returns: ObjectID of the user - this needs to be stored on client, because it will be passed back?

function createUser(req, res, next) {
  // post => /createUser/:name/:picture
  var newUser = new User({
    email: req.param("name"),
    picture: req.param("picture"),
    token: req.param("token")
  });
  newUser.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        console.log("some error");
        return res.send(400);
      }
      console.log("[NEED-VALIDATION.signup] " + err);
      return res.send(400);
    }
    // save was successful
    // now only return back what we want to
    return res.json({
      message: 'account created'
    });
  });
}
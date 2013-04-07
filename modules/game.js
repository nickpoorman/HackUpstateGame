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

app.get('/test', function(req, res, next) {
  return res.json({
    message: "working"
  })
});

// require auth token
app.get('/numPoints', getNumPoints);

app.get('/getHill', getHill);

// require // auth_token
app.get('/capture/:numPoints', caputreHill);

app.get('/leaderboard', getLeaderboard);

// need a resource to add a hill?

function getNumPoints(req, res, next) {
  // get => /numPoints/:userID
  // load the user
  console.log("user is: ");
  console.log(req.user);
  if (!req.user) {
    return res.json(400, {
      message: "not authed"
    });
  }

  return res.json({
    numPoints: req.user.numPoints
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
  // post => /capture/:userID/:numPoints

  // first check to make sure they have the number of points they say they need
  if (!req.user) {
    return res.json(400, {
      message: "not authed"
    });
  }

  if (req.user.numPoints < req.param("numPoints")) {
    return res.json(400, {
      message: "insufficient points"
    });
  }

  // when a user capture's the hill we have to subtract that number of points from the user, ...do upsert and forget
  var yourBattlePoints = req.param("numPoints");
  req.user.numPoints = req.user.numPoints - yourBattlePoints;
  req.user.save(function(err) {
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
      // if you are the king, then add the points
      if (typeof king !== "undefined" && typeof king.user !== "undefined" && String(king.user) === String(req.user._id)) {
        // you are the user
        console.log("you are already the king");
        yourBattlePoints = Number(yourBattlePoints) + Number(king.points);
      }
      var lost = {
        winner: 0,
        remaining: yourBattlePoints
      };
      var message = "win";

      if (typeof king !== "undefined" && typeof king.user !== "undefined" && String(king.user) !== String(req.user._id) && king.points) {
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
          user: req.user,
          time: new Date(),
          facebookId: req.user.facebookId
        });
        point.king = {};
        point.king.points = lost.remaining;
        point.king.user = req.user;

        point.save(function(err) {
          if (err) {
            return res.json(400, "DB ERROR");
          }
          return res.json({
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
  // [{
  //   elapsedTime: asfsdf,
  //   name: asdfasdf ,
  //   picture: adsfadsf,
  //   king: asdfasd
  // }]
  // this should return an object of all the users on the hill
  Point.findOne({
    key: 0
  }, function(err, point) {
    if (err) {
      return res.json(400, {
        message: "could not find hill"
      });
    }

    // need to get the total time each person has captured the hill for
    // first get the array and sort them by time
    var caps = point.captures;
    var sorted = _.sortBy(caps, function(capture) {
      return capture.time;
    });

    // need to go through each of the times and calculate the difference between the time and the next time
    var times = [];
    for (var i = 0; i < sorted.length - 1; i++) {
      var time1 = sorted[i + 1].time;
      var time2 = sorted[i].time;
      times.push(time1 - time2);
    }

    // finally we need to add the elapsed time between the last element in sorted and the current time
    times.push((Date.now - sorted[sorted.length-1].time));

    var times = {};
    for(var i = 0; i < sorted.length; i++){
      if(times[String(sorted[i].user)]){
        // we already added it so just increment it
        times[String(sorted[i].user)] = Number(times[String(sorted[i].user)]) + Number(sorted[i].time);
      }
      times[String(sorted[i].user)] = sorted[i].time;
    }

    var pairs = _.pairs(times);

    var pairSort = _.sortBy(caps, function(pair) {
      return pair[0];
    });

    var topFive = pairSort.reverse().slice(0, 5);
    return res.json(topFive);
  });
}
var debug = true;
var path = require("path");
var express = require("express");
var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validators;

var User = require('../models/user');
var Point = require('../models/point');

var battlePoints = require('../models/battlePoints');

var app = module.exports = express();
var viewPath = path.resolve(__dirname, '..', 'views');
app.set("views", viewPath);
app.set('view engine', 'jade');

app.get('/numPoints/:userID', getNumPoints);

app.get('/getHill', getHill);

app.get('/checkin/:userID/:numPoints', caputreHill);

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
	});
}

function caputreHill(req, res, next) {
	// post => /checkin/:userID/:numPoints

	// first check to make sure they have the numbe of points they say they need
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
	user.numberOfSubjects = user.numberOfSubjects - req.param("numPoints");
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
		var lost = battlePoints();
		// problem... if you loose your points are still the same

		var message = lost ? "loose" : "win";

		if (!lost) {
			// we need some record that they we're kicked of the hill
			// only add them as a capture if they win?

			// then wee need to add a record to the hill to keep track that the user checked in there
			// update the record ...push object to hill
			Point.update({
				key: 0
			}, {
				$push: {
					captures: {
						user: user,
						time: new Data()
					}
				}
			}, function(err, numberAffected, raw) {
				if (err) return console.log(err);

				return req.json({
					message: message
				})
			});
		}
	});
}

function getLeaderboard(req, res, next) {
	// get => /leaderboard
	// this should return an object of all the users on the hill

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
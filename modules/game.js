var debug = true;
var path = require("path");
var express = require("express");
var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validators;

var User = require('../models/user');
var Point = require('../models/point');

var app = module.exports = express();
var viewPath = path.resolve(__dirname, '..', 'views');
app.set("views", viewPath);
app.set('view engine', 'jade');

app.get('/numPoints/:userID', getNumPoints);

app.get('/capture/:userID/:numPoints', caputreHill);

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
	User.update({
		key: 0
	}, {
		$inc: {
			numberOfSubjects: 1
		}
	}, {
		upsert: true
	}, function(err, numberAffected, raw) {
		if (err) return console.log(err);
	});

	// then we have to call the function to determine the person who wins,
	// then return a message on who won

	User.findOne({}, function(err, point) {
		if (err) {
			return res.json(400, {
				message: 'DB Error'
			});
		}
		return res.json(200, point);
	});

}

function getLeaderboard(req, res, next) {
	// get => /leaderboard

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
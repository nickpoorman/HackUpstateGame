var debug = true;
var path = require("path");
var express = require("express");
var forms = require('forms'),
	fields = forms.fields,
	validators = forms.validators;

var User = require('../models/user');
//var Point = require('');

var app = module.exports = express();
var viewPath = path.resolve(__dirname, '..', 'views');
app.set("views", viewPath);
app.set('view engine', 'jade');

app.get('/numPoints/:userID', getNumPoints);

app.get('/capture/:userID/:numPoints', caputreHill);

function getNumPoints(req, res, next) {
	// get => /numPoints/:userID
	Point.findOne({}, function(err, point) {
		if (err) {
			return res.json(400, {
				message: 'DB Error'
			});
		}
		return res.json(200, point);
	});
}

function caputreHill(req, res, next) {
	// post => /checkin/:userID/:numPoints
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
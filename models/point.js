/**
 * User Schema
 */

var util = require('util');


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passport = require('passport');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var moment = require('moment');
var async = require("async");

var PointSchema = new Schema({
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  geo: {
    type: [Number],
    index: '2d'
  }
  //name
  // in the future this should have a location index to seach on

});

PointSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Point", PointSchema);
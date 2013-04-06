/**
 * User Schema
 */

var util = require('util');


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('user');

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
  // in the future this should have a location index to seach on
  geo: {
    type: [Number],
    index: '2d'
  },
  key: {
    type: Number,
    index: {
      unique: true,
      sparse: true
    }
  },
  captures: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    time: {
      type: Date
    }
  }],
  king: {
    points: {
      type: Number
    }
    // this should prob be in there in the future.... for memoization
    // ,
    // user: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User'
    // }
  }
});

PointSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Point", PointSchema);
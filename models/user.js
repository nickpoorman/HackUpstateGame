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

var UserSchema = new Schema({
  createdAt: {
    type: Date
  },
  updatedAt: {
    type: Date
  },
  // email: {
  //   type: String,
  //   lowercase: true,
  //   trim: true,
  //   required: true,
  //   index: {
  //     unique: true
  //   }
  // },
  // username: {
  //   type: String,
  //   trim: true,
  //   required: true,
  //   index: {
  //     unique: true
  //   }
  // },
  // salt: {
  //   type: String,
  //   required: true
  // },
  // pwHash: {
  //   type: String,
  //   required: true
  // },
  // activated: {
  //   type: Boolean,
  //   default: false,
  //   required: true
  // },
  // confirmationToken: {
  //   type: String,
  //   index: {
  //     unique: true,
  //     sparse: true
  //   }
  // },
  // passwordResetToken: {
  //   type: String,
  //   index: {
  //     unique: true,
  //     sparse: true
  //   }
  // },
  // passwordResetTokenCreatedAt: {
  //   type: Date
  // },
  facebookId: {
    type: String,
    index: {
      unique: true,
      sparse: true
    }
  },
  //game stuff
  numPoints: {
    type: Number,
    default: 0
  }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.createdAt) {
    this.createdAt = new Date();
  }
  next();
});

/*
  This is some middleware to setup the date for the password reset token.
  Now it doesn't have to be taken care of in the controllers.
*/
// UserSchema.pre('save', function(next) {
//   if (this.passwordResetToken && typeof this.passwordResetTokenCreatedAt == "undefined") {
//     this.passwordResetTokenCreatedAt = new Date();
//   }
//   if (typeof this.passwordResetToken == "undefined") {
//     this.passwordResetTokenCreatedAt = undefined;
//   }
//   next();
// });

// UserSchema.methods.createPasswordResetToken = function(callback) {
//   var that = this;
//   var key = this.email + moment().format();
//   var hash = crypto.createHash('sha256').update(key).digest("hex");
//   that.passwordResetToken = hash;
//   callback(that);
// }

// This doesn't really need a callback now that we are using crypto.
// UserSchema.methods.createConfirmationToken = function(callback) {
//   var that = this;
//   var key = this.email + moment().format();
//   var hash = crypto.createHash('sha256').update(key).digest("hex");
//   that.confirmationToken = hash;
//   callback(that);
// }

// UserSchema.methods.verifyPassword = function(password, callback) {
//   bcrypt.compare(password, this.pwHash, callback);
// };

// UserSchema.static("authenticate", function(email, password, callback) {
//   // check it see if it's an email or a username
//   var isEmail = email.match(/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/);
//   var query = {
//     username: email
//   };
//   if (isEmail) {
//     query = {
//       email: email
//     };
//   }
//   this.findOne(query, function(err, user) {
//     if (err) {
//       return callback(err);
//     }
//     if (!user) {
//       return callback(null, false, {
//         message: 'The email or username you entered does not belong to any account.',
//         errorCode: 1
//       });
//     }
//     user.verifyPassword(password, function(err, passwordCorrect) {
//       if (err) {
//         return callback(err);
//       }
//       if (!passwordCorrect) {
//         return callback(null, false, {
//           message: 'The password you entered is incorrect. Please try again (make sure your caps lock is off).',
//           errorCode: 2
//         });
//       }
//       // should verify the account was activated
//       if (!user.activated) {
//         return callback(null, false, {
//           message: 'Your account has not been activated. Please check your email.',
//           errorCode: 3
//         });
//       }
//       return callback(null, user);
//     });
//   });
// });

// The problem here is getters and setters can't be async
// so any calls inside of them must be sync
// Virtual Getter - don't think I want to be storing this... even if it's just in memory
// schema.virtual('password').get( function () {
//     return this._password;
// });
// Setter Function
// UserSchema.methods.setPassword = function(password, done) {
//   var that = this;
//   bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash(password, salt, function(err, hash) {
//       that.pwHash = hash;
//       that.salt = salt;
//       done(that);
//     });
//   });
// };

UserSchema.static("findOrCreate", function(doc, callback) {
  var that = this;
  console.log("id is: " + doc.id);
  this.findOne({
    facebookId: doc.id
  }, function(err, user) {
    //if (err) return handleError(err);
    // may be null if no document matched
    if (user) {
      console.log("got the user");
      return callback(err, user);
    }

    console.log("did not get the user");
    // if there was no user there create one and return it
    that.create({facebookId: doc.id}, function(err, user) {
      console.log("error???: " + err);
      console.log("user???: " + user);
      console.log(user);
      return callback(err, user);
    });
  });
});

module.exports = mongoose.model("User", UserSchema);
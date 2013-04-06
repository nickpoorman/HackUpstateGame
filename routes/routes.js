/**
 * routes.js
 * try to namespace stuff under i when ever you can
 */
var passport = require("passport");
//var hbs = require('hbs');
var sanitize = require('validator').sanitize;

/*
 *  Simple route middleware to ensure user is authenticated.
 *   Use this route middleware on any resource that needs to be protected.  If
 *   the request is authenticated (typically via a persistent login session),
 *   the request will proceed.  Otherwise, the user will be redirected to the
 *   login page.
 */
var ensureAuthenticated = function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    // TODO: this will probably have to be changed
    res.send(["must auth"]);
  };

// var setResContentTypeToJSON = function(req, res, next) {
//     res.type('json');
//     return next();
//   };

/* escape helper for handlebars
 * It should escape <\script> tags to prevent XSS attacks. ie. <\/
 */
/*hbs.registerHelper('escape', function(str) {
  // take the object and stringify it
  var data = escape(JSON.stringify(str));
  return new hbs.handlebars.SafeString(data);
});*/

module.exports = function(app) {
  app.get("/", function(req, res) {
    res.render("index", {homeActive: true});
  });

  // route modules
  app.use(require('../modules/game.js'));

    // API
  //app.all("/api*", setResContentTypeToJSON);

  // API - private Authentication filter - https://fabianosoriani.wordpress.com/
  //https://fabianosoriani.wordpress.com/2011/08/15/express-api-on-node-js-with-mysql-auth/
  //app.all("/api/private*", ensureAuthenticated);
  // app.get "/account", ensureAuthenticated, auth.getAccount
  // app.get "/logout", auth.logout

  // Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));


};

// ============= helpers ============================
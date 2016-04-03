'use strict';

var slsAuth = require('serverless-authentication');
var Provider = slsAuth.Provider;
var Profile = slsAuth.Profile;

var signin = function(config, options, callback) {
  var customGoogle = new Provider(config);
  if(!options) {
    options = {};
  }
  options.signin_uri = 'https://accounts.google.com/o/oauth2/v2/auth';
  options.scope = 'profile email';
  options.response_type = 'code';
  customGoogle.signin(options, callback);
};

var callback = function(event, config, callback) {
  var customGoogle = new Provider(config);

  var profileMap = function(response) {
    return new Profile({
      id: response.id,
      name: response.displayName,
      email: response.emails ? response.emails[0].value : null,
      picture: response.image.url,
      provider: 'custom-google',
      _raw: response
    });
  };

  var options = {
    authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
    profile_uri: 'https://www.googleapis.com/plus/v1/people/me',
    profileMap: profileMap
  };

  customGoogle.callback(event, options, {authorization: {grant_type: 'authorization_code'}}, callback);
};

exports = module.exports = {
  signin: signin,
  callback: callback
};

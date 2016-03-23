// Config
var slsAuth = require('serverless-authentication');
var config = slsAuth.config;
var utils = slsAuth.utils;

// Providers
var facebook = require('serverless-authentication-facebook');
var google = require('serverless-authentication-google');
var microsoft = require('serverless-authentication-microsoft');

// Signin switch
function signin(event, callback) {
  var providerConfig = config(event);
  switch (event.provider) {
    case 'facebook':
      facebook.signin(providerConfig, {scope: 'email'}, callback);
      break;
    case 'google':
      google.signin(providerConfig, {scope: 'profile email'}, callback);
      break;
    case 'microsoft':
      microsoft.signin(providerConfig, {scope: 'wl.basic wl.emails'}, callback);
      break;
    default:
      callback('Invalid provider');
  }
}

// Callback switch
function callback(event, callback) {
  var providerConfig = config(event);
  switch (event.provider) {
    case 'facebook':
      facebook.callback(event, providerConfig, handleResponse);
      break;
    case 'google':
      google.callback(event, providerConfig, handleResponse);
      break;
    case 'microsoft':
      microsoft.callback(event, providerConfig, handleResponse);
      break;
    default:
      callback('Invalid provider');
  }

  function handleResponse(err, profile) {
    if (err) {
      callback(err);
    } else {
      var id = profile.provider + '-' + profile.id;
      // sets 1 minute expiration time as an example

      // here can be checked if user exist in db if not create new etc.

      var tokenData = {
        payload: {
          id: id
        },
        options: {
          expiresIn: 60
        }
      };
      
      utils.tokenResponse(tokenData, providerConfig, callback);
    }
  }
}

// Authorize
function authorize(event, callback) {
  var providerConfig = config(event);
  // this example uses simple expiration time validation
  try {
    var data = utils.readToken(event.authorizationToken, providerConfig.token_secret);
    callback(null, utils.generatePolicy(data.id, 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
}

exports = module.exports = {
  signin: signin,
  callback: callback,
  authorize: authorize
};
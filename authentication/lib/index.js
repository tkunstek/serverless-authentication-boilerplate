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
  var providerConfig = config(event.provider);
  switch(event.provider) {
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
  var providerConfig = config(event.provider);
  switch(event.provider) {
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
    if(err){
      callback(err);
    }else {
      var testing = false;
      var id = profile.provider + '-' +profile.id;
      // sets 1 minute expiration time as an example
      var expires = (new Date()).getTime()+(60*1000);

      // here can be checked if user exist in db if not create new etc.

      utils.tokenResponse({id: id, expires: expires}, providerConfig, callback);
    }
  }
}

// Authorize
function authorize(event, callback) {
  var providerConfig = config(event.provider);
  var error = false;
  // this example uses simple expiration time validation
  try {
    var data = utils.readToken(event.authorizationToken, providerConfig.token_secret);
    var now = (new Date()).getTime();
    if(data.expires < now) {
      error = true; //Token expired;
    }
  } catch(err) {
    error = true; //Invalid token;
  }
  if (!error) {
    callback(null, utils.generatePolicy(data.id, 'Allow', event.methodArn));
  } else {
    callback('Unauthorized');
  }
}

exports = module.exports = {
  signin: signin,
  callback: callback,
  authorize: authorize
}
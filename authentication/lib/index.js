'use strict';

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
  // This is just a demo state, in real application you could
  // create a hash and save it to dynamo db and then compare it
  // in the callback
  var state = 'state-'+event.provider;
  switch (event.provider) {
    case 'facebook':
      facebook.signin(providerConfig, {scope: 'email', state: state}, callback);
      break;
    case 'google':
      google.signin(providerConfig, {scope: 'profile email', state: state}, callback);
      break;
    case 'microsoft':
      microsoft.signin(providerConfig, {scope: 'wl.basic wl.emails', state: state}, callback);
      break;
    default:
      utils.errorResponse({error: 'Invalid provider'}, providerConfig, callback);
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
      utils.errorResponse({error: 'Invalid provider'}, providerConfig, callback);
  }

  function handleResponse(err, profile, state) {
    if (err) {
      utils.errorResponse({error: 'Unauthorized'}, providerConfig, callback);
    } else if(state !== 'state-'+profile.provider) {
      // here you should compare if the state returned from provider exist in dynamo db
      // and then expire it
      utils.errorResponse({error: 'State mismatch'}, providerConfig, callback);
    } else {
      var id = profile.provider + '-' + profile.id;

      // here can be checked if user exist in db and update properties pr if not, create new etc.

      // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js

      // sets 1 minute expiration time as an example
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
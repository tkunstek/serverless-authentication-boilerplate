'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Providers
const facebook = require('serverless-authentication-facebook');
const google = require('serverless-authentication-google');
const microsoft = require('serverless-authentication-microsoft');
const customGoogle = require('./custom-google');

const crypto = require('crypto');

// Signin switch
function signinHandler(event, callback) {
  const providerConfig = config(event);
  // This is just a demo state, in real application you could
  // create a hash and save it to dynamo db and then compare it
  // in the callback
  const state = `state-${event.provider}`;
  switch (event.provider) {
    case 'facebook':
      facebook.signin(providerConfig, { scope: 'email', state }, callback);
      break;
    case 'google':
      google.signin(providerConfig, { scope: 'profile email', state }, callback);
      break;
    case 'microsoft':
      microsoft.signin(providerConfig, { scope: 'wl.basic wl.emails', state }, callback);
      break;
    case 'custom-google':
      // See ./customGoogle.js
      customGoogle.signinHandler(providerConfig, { state }, callback);
      break;
    default:
      utils.errorResponse({ error: 'Invalid provider' }, providerConfig, callback);
  }
}

// Callback switch
function callbackHandler(event, callback) {
  const providerConfig = config(event);

  const handleResponse = (err, profile, state) => {
    if (err) {
      utils.errorResponse({ error: 'Unauthorized' }, providerConfig, callback);
    } else if (state !== `state-${profile.provider}`) {
      // here you should compare if the state returned from provider exist in dynamo db
      // and then expire it
      utils.errorResponse({ error: 'State mismatch' }, providerConfig, callback);
    } else {
      const id = `${profile.provider}-${profile.id}`;
      // here can be checked if user exist in db and update properties pr if not, create new etc.

      // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js

      // sets 1 minute expiration time as an example
      //

      // refresh
      // sign.write(id);
      // sign.end();

      const time = (new Date()).getTime();
      const refreshPayload = `${id}-${time}`;
      const hmac = crypto.createHmac('sha256', providerConfig.token_secret);
      hmac.update(refreshPayload);

      const refresh = hmac.digest('hex');

      const tokenData = {
        payload: {
          id
        },
        options: {
          expiresIn: 60,
          refresh
        }
      };

      utils.tokenResponse(tokenData, providerConfig, callback);
    }
  };

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
    case 'custom-google':
      // See ./customGoogle.js
      customGoogle.callbackHandler(event, providerConfig, handleResponse);
      break;
    default:
      utils.errorResponse({ error: 'Invalid provider' }, providerConfig, callback);
  }
}

function refreshHandler(event, callback) {
  callback(null, {});
}

// Authorize
function authorize(event, callback) {
  const providerConfig = config(event);
  // this example uses simple expiration time validation
  try {
    const data = utils.readToken(event.authorizationToken, providerConfig.token_secret);
    callback(null, utils.generatePolicy(data.id, 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
}

exports = module.exports = {
  signinHandler,
  callbackHandler,
  refreshHandler,
  authorize
};

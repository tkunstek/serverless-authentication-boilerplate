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

function createResponseData(id, providerConfig) {
  // here can be checked if user exist in db and update properties pr if not, create new etc.

  // create example refresh token
  const time = (new Date()).getTime();
  const hmac = crypto.createHmac('sha256', providerConfig.token_secret);
  hmac.update(`${id}-${time}`);
  const refresh = hmac.digest('hex');
  // then save refresh token to dynamo db for later comparison
  // in the example token is not saved

  // sets 1 minute expiration time as an example
  //
  return {
    payload: {
      id
    },
    options: {
      expiresIn: 60
    },
    refresh
  };
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
      // in example only id is added to token payload
      // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
      const id = `${profile.provider}-${profile.id}`;
      utils.tokenResponse(createResponseData(id, providerConfig), providerConfig, callback);
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
  const providerConfig = config({ provider: 'facebook' });
  const refresh = event.refresh;

  if ((/^[A-Fa-f0-9]{64}$/).test(refresh)) {
    const data = createResponseData('temp-id', providerConfig);
    const token = utils.createToken(data.payload, providerConfig.token_secret, data.options);
    callback(null, { token, refresh: data.refresh });
  } else {
    callback('Invalid refresh token');
  }
}

exports = module.exports = {
  signinHandler,
  callbackHandler,
  refreshHandler
};

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

// General
const crypto = require('crypto');
const cache = require('./cache');

// Signin switch
function signinHandler(event, callback) {
  const providerConfig = config(event);
  // This is just a demo state, in real application you could
  // create a hash and save it to dynamo db and then compare it
  // in the callback
  const buffer = crypto.randomBytes(64);
  const state = buffer.toString('hex');
  cache.saveState(state, (error) => {
    if (!error) {
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
    } else {
      utils.errorResponse({ error }, providerConfig, callback);
    }
  });
}

function createResponseData(id, providerConfig) {
  // here can be checked if user exist in db and update properties pr if not, create new etc.

  // create example refresh token
  const time = (new Date()).getTime();
  const hmac = crypto.createHmac('sha256', providerConfig.token_secret);
  hmac.update(`${id}-${time}`);
  const refreshToken = hmac.digest('hex');
  // then save refresh token to dynamo db for later comparison
  // in the example token is not saved

  // sets 15 seconds expiration time as an example
  //

  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: 15
    }
  };

  return {
    authorizationToken,
    refreshToken
  };
}

// Callback switch
function callbackHandler(event, callback) {
  const providerConfig = config(event);

  const handleResponse = (err, profile, state) => {
    if (err) {
      utils.errorResponse({ error: 'Unauthorized' }, providerConfig, callback);
    } else {
      cache.getState(state, (cacheError, cacheState) => {
        if (cacheError) {
          utils.errorResponse({ error: cacheError }, providerConfig, callback);
        } else if (state !== cacheState) {
          // here you should compare if the state returned from provider exist in dynamo db
          // and then expire it
          utils.errorResponse({ error: 'State mismatch' }, providerConfig, callback);
        } else {
          // in example only id is added to token payload
          // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
          const id = `${profile.provider}-${profile.id}`;
          const data = Object.assign(createResponseData(id, providerConfig), { id });
          utils.tokenResponse(data, providerConfig, callback);
        }
      });
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
      customGoogle.callbackHandler(event, providerConfig, handleResponse); // See ./customGoogle.js
      break;
    default:
      utils.errorResponse({ error: 'Invalid provider' }, providerConfig, callback);
  }
}

function refreshHandler(event, callback) {
  const refreshToken = event.refresh_token;
  const id = event.id;
  // user refresh token to get userid & provider from cache table

  if ((/^[A-Fa-f0-9]{64}$/).test(refreshToken)) {
    const providerConfig = config({ provider: '' });
    const data = createResponseData(id, providerConfig);
    const authorization_token =
      utils.createToken(
        data.authorizationToken.payload,
        providerConfig.token_secret,
        data.authorizationToken.options);
    callback(null, { authorization_token, refresh_token: data.refreshToken, id });
  } else {
    callback('Invalid refresh token');
  }
}

exports = module.exports = {
  signinHandler,
  callbackHandler,
  refreshHandler
};

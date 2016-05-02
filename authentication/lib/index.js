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
  cache.createState((error, state) => {
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

function hash(data, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}

function createResponseData(id) {
  // sets 15 seconds expiration time as an example
  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: 15
    }
  };

  return { authorizationToken };
}

// Callback switch
function callbackHandler(event, callback) {
  const providerConfig = config(event);

  const handleResponse = (err, profile, state) => {
    if (err) {
      utils.errorResponse({ error: 'Unauthorized' }, providerConfig, callback);
    } else {
      cache.expireState(state, (cacheError, cacheState) => {
        if (cacheError) {
          utils.errorResponse({ error: cacheError }, providerConfig, callback);
        } else if (state !== cacheState) {
          // here you should compare if the state returned from provider exist in dynamo db
          // and then expire it
          utils.errorResponse({ error: 'State mismatch' }, providerConfig, callback);
        } else {
          // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
          const id = hash(`${profile.provider}-${profile.id}`, providerConfig.token_secret);
          const data = createResponseData(id, providerConfig);
          cache.saveRefreshToken(id, (error, refreshToken) => {
            if (!error) {
              utils.tokenResponse(Object.assign(data, { refreshToken }), providerConfig, callback);
            } else {
              utils.errorResponse({ error }, providerConfig, callback);
            }
          });
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
  // user refresh token to get userid & provider from cache table
  cache.revokeRefreshToken(refreshToken, (error, res) => {
    const providerConfig = config({ provider: '' });
    const id = res.id;
    const data = Object.assign(createResponseData(id, providerConfig), { refreshToken: res.token });

    if (error) {
      callback(error);
    } else {
      const authorization_token =
        utils.createToken(
          data.authorizationToken.payload,
          providerConfig.token_secret,
          data.authorizationToken.options);
      callback(null, { authorization_token, refresh_token: data.refreshToken, id });
    }
  });
}

exports = module.exports = {
  signinHandler,
  callbackHandler,
  refreshHandler
};

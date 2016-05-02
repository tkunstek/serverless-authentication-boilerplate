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
const async = require('async');

// Helper functions
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


/**
 * Sign In Handler
 * @param event
 * @param callback
 */
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


/**
 * Callback Handler
 * @param event
 * @param callback
 */
function callbackHandler(event, callback) {
  const providerConfig = config(event);

  const handleResponse = (error, profile, state) => {
    if (error) {
      utils.errorResponse({ error: 'Unauthorized' }, providerConfig, callback);
    } else {
      cache.revokeState(state, (cacheError) => {
        if (cacheError) {
          utils.errorResponse({ error: cacheError }, providerConfig, callback);
        } else {
          // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
          // create user id hash from profile values
          const hmac = crypto.createHmac('sha256', providerConfig.token_secret);
          hmac.update(`${profile.provider}-${profile.id}`);
          const id = hmac.digest('hex');

          const data = createResponseData(id, providerConfig);
          async.parallel({
            refreshToken: (_callback) => {
              cache.saveRefreshToken(id, _callback);
            },
            profile: (_callback) => {
              // Here you can save the profile to DynamoDB if it doesn't already exist
              // In this example it just makes empty callback to continue and nothing is saved.
              _callback(null);
            }
          }, (saveError, results) => {
            if (!saveError) {
              utils.tokenResponse(
                Object.assign(data, { refreshToken: results.refreshToken }),
                providerConfig,
                callback
              );
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


/**
 * Refresh Handler
 * @param event
 * @param callback
 */
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

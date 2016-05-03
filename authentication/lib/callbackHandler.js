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

// Common
const crypto = require('crypto');
const cache = require('./cache');
const async = require('async');

const helpers = require('./helpers');
const createResponseData = helpers.createResponseData;

function createUserId(data, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Callback Handler
 * @param event
 * @param callback
 */
function callbackHandler(event, callback) {
  const providerConfig = config(event);

  /**
   * Error response
   * @param error
   */
  function errorResponse(error) {
    utils.errorResponse(
      error,
      providerConfig,
      callback
    );
  }

  /**
   * Token response
   * @param data
   */
  function tokenResponse(data) {
    utils.tokenResponse(
      data,
      providerConfig,
      callback
    );
  }

  /**
   * Handles the response
   * @param error
   * @param profile
   * @param state
   */
  const handleResponse = (error, profile, state) => {
    if (error) {
      // Error response if something went wrong at the first place
      errorResponse({ error: 'Unauthorized' });
    } else {
      cache.revokeState(state, (stateError) => {
        if (stateError) {
          // Error response if state saving fail or state is not valid
          errorResponse({ error: stateError });
        } else {
          const id = createUserId(`${profile.provider}-${profile.id}`, providerConfig.token_secret);
          const data = createResponseData(id, providerConfig);
          async.parallel({
            refreshToken: (_callback) => {
              // Save refresh token
              cache.saveRefreshToken(id, _callback);
            },
            profile: (_callback) => {
              // Here you can save the profile to DynamoDB if it doesn't already exist
              // In this example it just makes empty callback to continue and nothing is saved.
              // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
              _callback(null);
            }
          }, (saveError, results) => {
            if (!saveError) {
              // Token response
              tokenResponse(Object.assign(data, { refreshToken: results.refreshToken }));
            } else {
              // Error response
              errorResponse({ error });
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
      errorResponse({ error: 'Invalid provider' });
  }
}

exports = module.exports = callbackHandler;

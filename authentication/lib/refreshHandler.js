'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Common
const cache = require('./cache');
const helpers = require('./helpers');
const createResponseData = helpers.createResponseData;

/**
 * Refresh Handler
 * @param event
 * @param callback
 */
function refreshHandler(event, callback) {
  const refreshToken = event.refresh_token;
  // user refresh token to get userid & provider from cache table
  cache.revokeRefreshToken(refreshToken, (error, results) => {
    if (error) {
      callback(error);
    } else {
      const providerConfig = config({ provider: '' });
      const id = results.id;
      const data =
        Object.assign(createResponseData(id, providerConfig), { refreshToken: results.token });
      const authorization_token =
        utils.createToken(
          data.authorizationToken.payload,
          providerConfig.token_secret,
          data.authorizationToken.options);
      callback(null, { authorization_token, refresh_token: data.refreshToken, id });
    }
  });
}

exports = module.exports = refreshHandler;

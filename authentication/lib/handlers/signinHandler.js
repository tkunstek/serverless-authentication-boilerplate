'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Providers
const facebook = require('serverless-authentication-facebook');
const google = require('serverless-authentication-google');
const microsoft = require('serverless-authentication-microsoft');
const customGoogle = require('../custom-google');

// Common
const cache = require('../storage/cacheStorage');
const helpers = require('../helpers');

/**
 * Sign In Handler
 * @param event
 * @param callback
 */
function signinHandler(event, callback) {
  helpers.initEnvVariables(event.stage);
  const providerConfig = config(event);
  cache.createState()
    .then((state) => {
      switch (event.provider) {
        case 'facebook':
          facebook.signinHandler(providerConfig, { scope: 'email', state }, callback);
          break;
        case 'google':
          google.signinHandler(providerConfig, { scope: 'profile email', state }, callback);
          break;
        case 'microsoft':
          microsoft.signinHandler(providerConfig, { scope: 'wl.basic wl.emails', state }, callback);
          break;
        case 'custom-google':
          // See ./customGoogle.js
          customGoogle.signinHandler(providerConfig, { state }, callback);
          break;
        default:
          utils.errorResponse(
            { error: `Invalid provider: ${event.provider}` },
            providerConfig,
            callback
          );
      }
    })
    .catch((error) => utils.errorResponse({ error }, providerConfig, callback));
}

exports = module.exports = signinHandler;

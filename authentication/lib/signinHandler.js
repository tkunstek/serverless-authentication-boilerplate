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
const cache = require('./cache');

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

exports = module.exports = signinHandler;

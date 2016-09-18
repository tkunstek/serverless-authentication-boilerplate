'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Common
const helpers = require('../helpers');

// Authorize
const authorize = (event, callback) => {
  const stage = event.methodArn.split('/')[1] || 'dev'; // @todo better implementation
  let error = null;
  let policy;
  const authorizationToken = event.authorizationToken;
  if (authorizationToken) {
    try {
      // const providerConfig = config(event, helpers.getEnvVars(stage));
      // this example uses simple expiration time validation
      const data = utils.readToken(authorizationToken, helpers.getEnvVars(stage).tokenSecret);
      policy = utils.generatePolicy(data.id, 'Allow', event.methodArn);
    } catch (err) {
      error = 'Unauthorized';
    }
  } else {
    error = 'Unauthorized';
  }
  callback(error, policy);
};


exports = module.exports = authorize;

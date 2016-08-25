'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Authorize
function authorize(event, callback) {
  let error = null;
  let policy;
  if (event.authorizationToken) {
    try {
      const providerConfig = config(event);
      // this example uses simple expiration time validation
      const data = utils.readToken(event.authorizationToken, providerConfig.token_secret);
      policy = utils.generatePolicy(data.id, 'Allow', event.methodArn);
    } catch (err) {
      error = 'Unauthorized';
    }
  } else {
    error = 'Unauthorized';
  }
  callback(error, policy);
}

exports = module.exports = {
  authorize
};

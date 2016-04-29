'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Authorize
function authorize(event, callback) {
  try {
    const providerConfig = config(event);
    // this example uses simple expiration time validation
    const data = utils.readToken(event.authorizationToken, providerConfig.token_secret);
    callback(null, utils.generatePolicy(data.id, 'Allow', event.methodArn));
  } catch (err) {
    callback('Unauthorized');
  }
}

exports = module.exports = {
  authorize
};

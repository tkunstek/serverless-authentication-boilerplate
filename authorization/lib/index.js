'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Environmental Variables
const decamelize = require('decamelize');
const fs = require('fs');
const YAML = require('js-yaml');
const env = YAML.load(fs.readFileSync('./env.yml').toString());

// temp helper
const initEnvVariables = (stage) => {
  const vars = env[stage];
  if (vars) {
    for (const key in vars) {
      if (vars.hasOwnProperty(key)) {
        const upperKey = decamelize(key).toUpperCase();
        process.env[upperKey] = vars[key];
      }
    }
  }
};

// Authorize
const authorize = (event, callback) => {
  if(event.stage === 'test-request') {
    event.stage = 'dev';
  }
  initEnvVariables(event.stage);
  let error = null;
  let policy;
  const authorizationToken = event.authorizationToken || event.headers.authorizationToken;
  if (authorizationToken) {
    try {
      const providerConfig = config(event);
      console.log('providerConfig', providerConfig);
      // this example uses simple expiration time validation
      const data = utils.readToken(authorizationToken, providerConfig.token_secret);
      policy = utils.generatePolicy(data.id, 'Allow', event.methodArn);
    } catch (err) {
      error = 'Unauthorized';
    }
  } else {
    error = 'Unauthorized';
  }
  callback(error, policy);
};


exports = module.exports = {
  authorize
};

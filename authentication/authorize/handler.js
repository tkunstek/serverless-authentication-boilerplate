'use strict';

// Require Serverless ENV vars
var ServerlessHelpers = require('serverless-helpers-js').loadEnv();

// Authentication logic
var lib = require('../lib');

module.exports.handler = function(event, context) {
  return lib.authorize(event, context.done);
};
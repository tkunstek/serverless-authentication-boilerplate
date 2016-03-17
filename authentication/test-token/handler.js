'use strict';

// Require Serverless ENV vars
var ServerlessHelpers = require('serverless-helpers-js').loadEnv();

module.exports.handler = function(event, context) {
  return context.done(null, {username: event.username});
};
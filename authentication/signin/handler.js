'use strict';

// Authentication logic
var lib = require('../lib');

module.exports.handler = function(event, context) {
  return lib.signin(event, context.done);
};
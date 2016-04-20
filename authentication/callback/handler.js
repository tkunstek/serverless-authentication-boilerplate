'use strict';

// Authentication logic
const lib = require('../lib');

module.exports.handler =
  (event, context) =>
    lib.callbackHandler(event, context.done);

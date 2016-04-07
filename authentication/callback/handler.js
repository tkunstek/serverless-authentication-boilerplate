'use strict';

// Authentication logic
let lib = require('../lib');

module.exports.handler = (event, context) => {
  return lib.callback(event, context.done);
};
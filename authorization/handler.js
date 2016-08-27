'use strict';

const authorizeHandler = require('./lib').authorize;

module.exports.authorize =
  (event, context, cb) =>
    authorizeHandler(event, cb);

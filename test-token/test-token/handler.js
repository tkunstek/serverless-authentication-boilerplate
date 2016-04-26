'use strict';

module.exports.handler =
  (event, context, callback) =>
    callback(null, { username: event.username });

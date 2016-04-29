'use strict';

module.exports.handler =
  (event, context, callback) => {
    if (event.username) {
      return callback(null, { username: event.username });
    }
    return callback('Invalid request');
  };

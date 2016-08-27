'use strict';

module.exports.test = (event, context, cb) => {
  if (event.username) {
    cb(null, { username: event.username });
  }
  cb('Invalid request');
};
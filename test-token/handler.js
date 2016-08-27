'use strict';

module.exports.test = (event, context, cb) => {
  if (event.principalId) {
    cb(null, { username: event.principalId });
  }
  cb('Invalid request');
};
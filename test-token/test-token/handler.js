'use strict';

module.exports.handler =
  (event, context) =>
    context.done(null, { username: event.username });

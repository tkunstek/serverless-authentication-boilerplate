'use strict';

module.exports.handler = (event, context) => {
  return context.done(null, {username: event.username});
};

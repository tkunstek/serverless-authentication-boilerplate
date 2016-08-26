'use strict';

const signinHandler = require('./lib/handlers/signinHandler');
const callbackHandler = require('./lib/handlers/callbackHandler');
const refreshHandler = require('./lib/handlers/refreshHandler');

module.exports.signin = (event, context, cb) => signinHandler(event, cb);

module.exports.callback = (event, context, cb) => callbackHandler(event, cb);

module.exports.refresh = (event, context, cb) => refreshHandler(event, cb);
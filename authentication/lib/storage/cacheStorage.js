'use strict';

// const faunaCache = require('./fauna/faunaCache');
const dynamoCache = require('./dynamo/dynamoCache');

// when changing cache storage
// remember to uncomment
// require of alternative e.g. fauna cache module
exports = module.exports = dynamoCache;

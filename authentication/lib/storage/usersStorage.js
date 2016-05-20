'use strict';

const Promise = require('bluebird');

const saveDatabase = (profile) => new Promise((resolve, reject) => {
  if (profile) {
    resolve(null);
  } else {
    reject('Invalid profile');
  }
});

const saveCognito = (profile) => new Promise((resolve, reject) => {
  if (profile) {
    resolve(null);
  } else {
    reject('Invalid profile');
  }
});

const saveUser = (profile) => {
  // just temp switch
  // Here you can save the profile to DynamoDB if it doesn't already exist
  // In this example it just makes empty callback to continue and nothing is saved.
  // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js

  if (true) {
    return saveDatabase(profile);
  }
  return saveCognito(profile);
};

exports = module.exports = {
  saveUser
};

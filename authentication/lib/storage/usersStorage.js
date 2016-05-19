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


exports = module.exports = {
  saveDatabase,
  saveCognito
};

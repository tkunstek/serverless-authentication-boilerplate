'use strict';

// Common
const AWS = require('aws-sdk');
const config = { region: process.env.SERVERLESS_REGION };
const dynamodb = new AWS.DynamoDB.DocumentClient(config);
const Promise = require('bluebird');
const cognitoidentity = new AWS.CognitoIdentity({ region: process.env.COGNITO_REGION });

const saveDatabase = (profile) => new Promise((resolve, reject) => {
  if (profile) {
    resolve(null);
  } else {
    reject('Invalid profile');
  }
});

const saveCognito = (profile) => new Promise((resolve, reject) => {
  if (profile) {
    // Use AWS console or AWS-CLI to create identity pool
    // Add Cognito allowing statement to policy
    // {
    //   "Effect": "Allow",
    //   "Action": [
    //   "cognito-sync:*",
    //   "cognito-identity:*"
    // ],
    //   "Resource": "arn:aws:cognito-identity:*:*:*"
    // }
    cognitoidentity.getOpenIdTokenForDeveloperIdentity({
      IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
      Logins: {
        [process.env.COGNITO_PROVIDER_NAME]: profile.userId
      }
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  } else {
    reject('Invalid profile');
  }
});

const saveToUserPools = (profile) => new Promise((resolve, reject) => {
  if (profile) {
    resolve(null);
  } else {
    reject('Invalid profile');
  }
});

const saveUser = (profile) => {
  // just temp switch

  // Here you can save the profile to DynamoDB, AWS Cognito or where ever you wish
  // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js

  if (true) {
    return saveDatabase(profile);
  }
  return saveCognito(profile);
};

exports = module.exports = {
  saveUser
};

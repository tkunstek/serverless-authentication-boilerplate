'use strict';

// Common
const AWS = require('aws-sdk');
// const config = { region: process.env.SERVERLESS_REGION };
// const dynamodb = new AWS.DynamoDB.DocumentClient(config);
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
  // if (profile) {
  //   // Use AWS console or AWS-CLI to create identity pool
  //   cognitoidentity.getOpenIdTokenForDeveloperIdentity({
  //     IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
  //     Logins: {
  //       [process.env.COGNITO_PROVIDER_NAME]: profile.userId
  //     }
  //   }, (err) => {
  //     if (err) {
  //       reject(err);
  //     } else {
  //       resolve();
  //     }
  //   });
  // } else {
  //   reject('Invalid profile');
  // }
  if (profile) {
    const attributes = [
      'name',
      'email',
      'picture'
    ];

    const UserAttributes = attributes.map(key => ({ Name: key, Value: profile[key] }));
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
    const params = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: profile.userId,
      DesiredDeliveryMediums: [
        'EMAIL'
      ],
      ForceAliasCreation: false,
      MessageAction: 'SUPPRESS',
      TemporaryPassword: 'tempPassword1!',
      UserAttributes
    };

    cognitoIdentityServiceProvider.adminCreateUser(params, (err, data) => {
      if(err) {
        reject(err);
      } else {
        resolve();
      }
    });
  } else {
    reject('Invalid profile');
  }
});

const saveUser = (profile) => {
  // just temp switch

  // Here you can save the profile to DynamoDB, AWS Cognito or where ever you wish
  // profile class: https://github.com/laardee/serverless-authentication/blob/master/src/profile.js
  const useDatabase = false;
  if (useDatabase) {
    return saveDatabase(profile);
  }
  return saveCognito(profile);
};

exports = module.exports = {
  saveUser
};

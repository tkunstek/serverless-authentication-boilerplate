'use strict';

const table = `${process.env.SERVERLESS_STAGE}-${process.env.SERVERLESS_PROJECT}-cache`;
const config = { region: process.env.SERVERLESS_REGION };
if (process.env.LOCAL_DDB_ENDPOINT) config.endpoint = process.env.LOCAL_DDB_ENDPOINT;

// Common
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(config);
const async = require('async');
const crypto = require('crypto');

function hash() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Creates OAuth State
 * @param callback
 */
function createState(callback) {
  const state = hash();
  const params = {
    TableName: table,
    Item: {
      Token: state,
      Type: 'STATE',
      Expired: false
    }
  };

  dynamodb.put(params, (error) => callback(error, state));
}

/**
 * Revokes OAuth State
 * @param state
 * @param callback
 */
function revokeState(state, callback) {
  async.waterfall([
    (_callback) => {
      const params = {
        TableName: table,
        ProjectionExpression: '#token, #type, Expired',
        KeyConditionExpression: '#token = :token and #type = :type',
        ExpressionAttributeNames: {
          '#token': 'Token',
          '#type': 'Type'
        },
        ExpressionAttributeValues: {
          ':token': state,
          ':type': 'STATE'
        }
      };
      dynamodb.query(params, _callback);
    },
    (data, _callback) => {
      const item = data.Items[0];
      if (item.Expired) {
        _callback('State expired'); // @todo move to query, e.g. filter?
      } else {
        const params = {
          TableName: table,
          Item: {
            Token: state,
            Type: 'STATE',
            Expired: true
          }
        };

        dynamodb.put(params, (error) => {
          if (!error) {
            _callback(null, item.Token);
          } else {
            _callback(error);
          }
        });
      }
    }
  ], (err, token) => {
    let error = err;
    if (!error && state !== token) {
      error = 'State mismatch';
    }
    callback(error, token);
  });
}

/**
 * Creates and saves refresh token
 * @param user
 * @param callback
 */
function saveRefreshToken(user, callback) {
  const token = hash();
  const params = {
    TableName: table,
    Item: {
      Token: token,
      Type: 'REFRESH',
      Expired: false,
      UserId: user
    }
  };

  dynamodb.put(params, (error) => callback(error, token));
}

/**
 * Revokes old refresh token and creates new
 * @param oldToken
 * @param callback
 */
function revokeRefreshToken(oldToken, callback) {
  if (oldToken.match(/[A-Fa-f0-9]{64}/)) {
    const token = hash();
    async.waterfall([
      (_callback) => {
        const params = {
          TableName: table,
          ProjectionExpression: '#token, #type, #userId',
          KeyConditionExpression: '#token = :token and #type = :type',
          ExpressionAttributeNames: {
            '#token': 'Token',
            '#type': 'Type',
            '#userId': 'UserId'
          },
          ExpressionAttributeValues: {
            ':token': oldToken,
            ':type': 'REFRESH'
          }
        };
        dynamodb.query(params, _callback);
      },
      (data, _callback) => {
        const UserId = data.Items[0].UserId;
        const params = {
          TableName: table,
          Item: {
            Token: token,
            Type: 'REFRESH',
            Expired: false,
            UserId
          }
        };
        dynamodb.put(params, (error) => _callback(error, UserId));
      },
      (UserId, _callback) => {
        const params = {
          TableName: table,
          Item: {
            Token: oldToken,
            Type: 'REFRESH',
            Expired: true,
            UserId
          }
        };
        dynamodb.put(params, (error) => _callback(error, UserId));
      }
    ], (err, id) => {
      callback(err, { id, token });
    });
  } else {
    callback('Invalid token');
  }
}

exports = module.exports = {
  createState,
  revokeState,
  saveRefreshToken,
  revokeRefreshToken
};

'use strict';

const table = `${process.env.SERVERLESS_STAGE}-${process.env.SERVERLESS_PROJECT}-cache`;
const config = { region: process.env.SERVERLESS_REGION };
if (process.env.LOCAL_DDB_ENDPOINT) config.endpoint = process.env.LOCAL_DDB_ENDPOINT;

// Common
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(config);
const async = require('async');
const crypto = require('crypto');

// Config
// const slsAuth = require('serverless-authentication');
// const config = slsAuth.config;
// const utils = slsAuth.utils;

function hash() {
  return crypto.randomBytes(48).toString('hex');
}

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

function expireState(state, callback) {
  async.waterfall([
    (_callback) => {
      const params = {
        TableName: table,
        ProjectionExpression: '#token, #type',
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
          _callback(null, data.Items[0].Token);
        } else {
          _callback(error);
        }
      });
    }
  ], (err, data) => {
    callback(err, data);
  });
}

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

function revokeRefreshToken(oldToken, callback) {
  const token = hash();
  async.waterfall([
    (_callback) => {
      const params = {
        TableName: table,
        ProjectionExpression: '#token, #type, UserId',
        KeyConditionExpression: '#token = :token and #type = :type',
        ExpressionAttributeNames: {
          '#token': 'Token',
          '#type': 'Type'
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
}

exports = module.exports = {
  createState,
  expireState,
  saveRefreshToken,
  revokeRefreshToken
};

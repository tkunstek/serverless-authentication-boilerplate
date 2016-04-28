'use strict';

const table = `${process.env.SERVERLESS_STAGE}-${process.env.SERVERLESS_PROJECT}-cache`;
const config = { region: process.env.SERVERLESS_REGION };
if (process.env.LOCAL_DDB_ENDPOINT) config.endpoint = process.env.LOCAL_DDB_ENDPOINT;

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(config);
const async = require('async');
const crypto = require('crypto');

function createState(callback) {
  const buffer = crypto.randomBytes(32);
  const state = buffer.toString('hex');
  const params = {
    TableName: table,
    Item: {
      Token: state,
      Type: 'STATE',
      Expired: false
    }
  };

  //console.log(dynamodb);

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
      
      // const params = {
      //   TableName: table,
      //   Key: { Token: state, Type: 'STATE' },
      // };
      //
      // dynamodb.put(params, (error) => {
      //   if (!error) {
      //     _callback(null, data.Items[0].Token);
      //   } else {
      //     _callback(error);
      //   }
      // });
    }
  ], (err, data) => {
    callback(err, data);
  });
}

function saveRefreshToken(token, user, callback) {
  const params = {
    TableName: table,
    Item: {
      Token: token,
      Type: 'REFRESH',
      Expired: false,
      Additional: {
        user
      }
    }
  };

  dynamodb.put(params, (error) => callback(error));
}

function revokeRefreshToken(oldToken, newToken, callback) {
  async.waterfall([
    (_callback) => {
      const params = {
        TableName: table,
        ProjectionExpression: '#token, #type',
        KeyConditionExpression: '#token = :token and #type = :type',
        ExpressionAttributeNames: {
          '#token': 'Additional.token',
          '#type': 'Type'
        },
        ExpressionAttributeValues: {
          ':token': oldToken,
          ':type': 'STATE'
        }
      };
      dynamodb.query(params, _callback);
    },
    (data, _callback) => {
      const params = {
        TableName: table,
        Key: { Hash: data.Items[0].Hash, Type: 'STATE' }
      };

      dynamodb.delete(params, (error) => {
        if (!error) {
          _callback(null, data.Items[0].Hash);
        } else {
          _callback(error);
        }
      });
    }
  ], (err, data) => {
    callback(err, data);
  });
}

exports = module.exports = {
  createState,
  expireState,
  saveRefreshToken,
  revokeRefreshToken
};

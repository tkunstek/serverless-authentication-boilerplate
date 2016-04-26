'use strict';

const table = `${process.env.SERVERLESS_STAGE}-${process.env.SERVERLESS_PROJECT}-cache`;
const config = { region: process.env.SERVERLESS_REGION };
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient(config);
const async = require('async');

function saveState(state, callback) {
  const params = {
    TableName: table,
    Item: {
      Hash: state,
      Type: 'STATE'
    }
  };

  dynamodb.put(params, (error) => callback(error));
}

function getState(state, callback) {
  async.waterfall([
    (_callback) => {
      const params = {
        TableName: table,
        ProjectionExpression: '#hash, #type',
        KeyConditionExpression: '#hash = :hash and #type = :type',
        ExpressionAttributeNames: {
          '#hash': 'Hash',
          '#type': 'Type'
        },
        ExpressionAttributeValues: {
          ':hash': state,
          ':type': 'STATE'
        }
      };
      dynamodb.query(params, _callback);
    },
    (data, _callback) => {
      const params = {
        TableName: table,
        Key: { Hash: state, Type: 'STATE' }
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
  saveState,
  getState
};

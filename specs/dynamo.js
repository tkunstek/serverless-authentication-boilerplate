'use strict';

const endpoint = process.env.LOCAL_DDB_ENDPOINT;
const project = process.env.SERVERLESS_PROJECT;
const stage = process.env.SERVERLESS_STAGE;
const region = process.env.SERVERLESS_REGION;
const table = [stage, project, 'cache'].join('-');
const resources = require('../s-resources-cf.json').Resources;

const async = require('async');
const DynamoDB = require('aws-sdk').DynamoDB;
const db = new DynamoDB({ endpoint, region });

let ready = false;

function init(cb) {
  resources.Dynamo.Properties.TableName = table;
  async.waterfall([
    (callback) => {
      db.listTables({}, callback);
    },
    (data, callback) => {
      const tables = data.TableNames;
      if (tables.indexOf(table) < 0) {
        db.createTable(resources.Dynamo.Properties, (err, created) => {
          if (!err) {
            callback(null, `table ${created.TableDescription.TableName} created`);
          } else {
            callback(err);
          }
        });
      } else {
        callback(null, `${table} already exists`);
      }
    }
  ], (err) => {
    if (!err) {
      ready = true;
    }
    if (cb) {
      cb(err);
    }
  });
}

function isReady() {
  return ready;
}

exports = module.exports = {
  init,
  isReady
};

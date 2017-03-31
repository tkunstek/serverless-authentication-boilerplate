'use strict';

const endpoint = process.env.LOCAL_DDB_ENDPOINT;
const project = process.env.PROJECT;
const stage = process.env.STAGE;
const region = process.env.REGION;
const table = [stage, project, 'cache'].join('-');

const fs = require('fs');
const YAML = require('js-yaml');

const env = YAML.load(fs.readFileSync('./authentication/serverless.yml').toString());
const resources = env.resources.Resources;

const async = require('async');
const DynamoDB = require('aws-sdk').DynamoDB;

const db = new DynamoDB({ endpoint, region });

let ready = false;

function init(cb) {
  resources.CacheTable.Properties.TableName = table;
  async.waterfall([
    (callback) => {
      db.listTables({}, callback);
    },
    (data, callback) => {
      const tables = data.TableNames;
      if (tables.indexOf(table) < 0) {
        db.createTable(resources.CacheTable.Properties, (err, created) => {
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

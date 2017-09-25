'use strict';

var MongoClient = require('mongodb').MongoClient;
const log = require('../../helpers').log;

let atlas_connection_uri = process.env.MONGODB_ATLAS_CLUSTER_URI;
let atlas_collection = process.env.MONGODB_COLLECTION;
let cachedDb = null;

const saveUser = (profile) => {
    log('save user', profile.id);
    try {
        if (cachedDb == null) {
            console.log('=> connecting to database');
            MongoClient.connect(atlas_connection_uri, function (err, db) {
                if(err!=null) {
                    console.error("an error occurred during connect", err);
                } else {
                    cachedDb = db;
                    cachedDb.collection(atlas_collection).insertOne(jsonContents).promise();
                }
            });
        } else {
            return cachedDb.collection(atlas_collection).insertOne(jsonContents).promise();
        }
    }
    catch (err) {
        console.error('an error occurred', err);
    }

};

module.exports = {
    saveUser
};
  
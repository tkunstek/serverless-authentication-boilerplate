'use strict';

const decamelize = require('decamelize');
// const fs = require('fs');
// const YAML = require('js-yaml');
// const env = YAML.load(fs.readFileSync('./env.yml').toString());
const env = require('../env.json');

const createResponseData = (id) => {
  // sets 15 seconds expiration time as an example
  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: 15
    }
  };

  return { authorizationToken };
};


/**
 * Initialize process.env variables -> check for better way
 * @param stage
 */
const initEnvVariables = (stage) => {
  const vars = env[stage];
  if (vars) {
    for (const key in vars) {
      if (vars.hasOwnProperty(key)) {
        const upperKey = decamelize(key).toUpperCase();
        process.env[upperKey] = vars[key];
      }
    }
  }
};

exports = module.exports = {
  createResponseData,
  initEnvVariables
};

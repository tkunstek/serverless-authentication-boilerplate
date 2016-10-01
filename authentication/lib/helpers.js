'use strict';

// Config
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;

// const fs = require('fs');
// const YAML = require('js-yaml');
// const env = YAML.load(fs.readFileSync('./env.yml').toString());
const env = require('../env.json');
const decamelize = require('decamelize');

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
// const initEnvVariables = (stage) => {
//   const vars = env[stage];
//   if (vars) {
//     for (const key in vars) {
//       if (vars.hasOwnProperty(key)) {
//         const upperKey = decamelize(key).toUpperCase();
//         process.env[upperKey] = vars[key];
//       }
//     }
//   }
// };
//
// const getEnvVars = (stage) => {
//   if(env.hasOwnProperty(stage)){
//     return env[stage];
//   }
//   throw new Error(`No vars for stage ${stage}`);
// };
//
// const getConfig = (stage, vars) => {
//   let envVars;
//   if (vars) {
//     envVars = vars;
//   } else {
//     if(env.hasOwnProperty(stage)){
//       envVars = env[stage];
//     } else {
//       throw new Error(`No vars for stage ${stage}`);
//     }
//   }
//   return envVars;
// };


const stageVars = (event) => env[event.stage];

const config = (event, vars) => {
  const stage = event.stage;
  const provider = event.provider;
  const host = event.host;

  const v = vars || env;

  let envVars;
  if (v.hasOwnProperty(stage)) {
    envVars = v[stage];
  } else {
    throw new Error(`No vars for stage ${stage}`);
  }

  const providers = {};
  for (const key in envVars) {
    if (envVars.hasOwnProperty(key)) {
      const value = envVars[key];
      const providerItem = (/provider(.*)?(Id|Secret)/g).exec(key);
      if (providerItem) {
        const providerName = providerItem[1].toLowerCase();
        const type = providerItem[2].toLowerCase();
        if (!providers[providerName]) {
          providers[providerName] = {};
        }
        providers[providerName][type] = value;
      }
    }
  }

  const redirectUri = envVars.redirectUri || `https://${host}/${stage}/authentication/callback/{provider}`;

  const providerConfig = {
    provider,
    stage,
    host,
    redirectClientURI: envVars.redirectClientURI,
    tokenSecret: envVars.tokenSecret,
    redirectUri: redirectUri.replace('{provider}', provider)
  };

  Object.assign(providerConfig, providers[provider]);

  for (const key in providerConfig) {
    if (providerConfig.hasOwnProperty(key)) {
      providerConfig[decamelize(key)] = providerConfig[key];
    }
  }

  return providerConfig;
};

const errorResponse = (params, providerConfig, cb) => {
  utils.errorResponse(params, { redirect_client_uri: providerConfig.redirectClientURI }, cb);
};

exports = module.exports = {
  createResponseData,
  config,
  errorResponse,
  stageVars
};

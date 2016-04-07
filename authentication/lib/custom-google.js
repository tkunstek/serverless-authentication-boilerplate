'use strict';

let slsAuth = require('serverless-authentication');
let Provider = slsAuth.Provider;
let Profile = slsAuth.Profile;

let signin = (config, options, callback) => {
  let customGoogle = new Provider(config);
  if(!options) {
    options = {};
  }
  options.signin_uri = 'https://accounts.google.com/o/oauth2/v2/auth';
  options.scope = 'profile email';
  options.response_type = 'code';
  customGoogle.signin(options, callback);
};

let callback = (event, config, callback) => {
  let customGoogle = new Provider(config);

  let profileMap = (response) => {
    return new Profile({
      id: response.id,
      name: response.displayName,
      email: response.emails ? response.emails[0].value : null,
      picture: response.image.url,
      provider: 'custom-google',
      _raw: response
    });
  };

  let options = {
    authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
    profile_uri: 'https://www.googleapis.com/plus/v1/people/me',
    profileMap: profileMap
  };

  customGoogle.callback(event, options, {authorization: {grant_type: 'authorization_code'}}, callback);
};

exports = module.exports = {
  signin: signin,
  callback: callback
};

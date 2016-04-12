'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;

describe('Authentication', () => {
  describe('Authorize', () => {
    it('should return policy', () => {
      let payload = {id: 'username-123'};
      let providerConfig = config({provider: 'facebook'});
      let authorizationToken = utils.createToken(payload, providerConfig.token_secret);
      let event = {
        provider: 'facebook',
        authorizationToken: authorizationToken
      };

      lib.authorize(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.principalId).to.be.equal(payload.id);
      });
    });
  });

  describe('Signin', () => {
    it('should fail to return token for crappyauth', () => {
      let event = {
        provider: 'crappyauth'
      };
      lib.signin(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.url).to.be.equal('http://localhost:3000/auth/crappyauth/?error=Invalid provider');
      });
    });
  });
});

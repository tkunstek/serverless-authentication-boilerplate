'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const expect = require('chai').expect;

describe('Authentication', () => {
  describe('Authorize', () => {
    it('should return policy', () => {
      const payload = { id: 'username-123' };
      const providerConfig = config({ provider: 'facebook' });
      const authorizationToken = utils.createToken(payload, providerConfig.token_secret);
      const event = {
        provider: 'facebook',
        authorizationToken
      };

      lib.authorize(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.principalId).to.be.equal(payload.id);
      });
    });
  });

  describe('Signin', () => {
    it('should fail to return token for crappyauth', () => {
      const event = {
        provider: 'crappyauth'
      };
      lib.signinHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.url).to.equal('http://localhost:3000/auth/crappyauth/?error=Invalid provider');
      });
    });
  });
});

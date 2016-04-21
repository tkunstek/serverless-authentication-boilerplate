'use strict';

const lib = require('../authorization/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const expect = require('chai').expect;

describe('Authorization', () => {
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
});

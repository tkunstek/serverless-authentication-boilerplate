'use strict';

const authorize = require('../authentication/lib/handlers/authorizeHandler');
const slsAuth = require('serverless-authentication');

const utils = slsAuth.utils;
const config = slsAuth.config;
const expect = require('chai').expect;

describe('Authorization', () => {
  describe('Authorize', () => {
    it('should return policy', (done) => {
      const payload = { id: 'username-123' };
      const providerConfig = config({ provider: '', stage: 'dev' });
      const authorizationToken = utils.createToken(payload, providerConfig.token_secret);
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn: 'arn:aws:execute-api:<regionId>:<accountId>:<apiId>/dev/<method>/<resourcePath>'
      };

      authorize(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.principalId).to.be.equal(payload.id);
        done(error);
      });
    });
  });
});

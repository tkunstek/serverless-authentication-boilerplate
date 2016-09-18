'use strict';

const authorize = require('../authentication/lib/handlers/authorizeHandler');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const expect = require('chai').expect;
const helpers = require('../authentication/lib/helpers');

describe('Authorization', () => {
  describe('Authorize', () => {
    it('should return policy', () => {
      const payload = { id: 'username-123' };
      // const providerConfig = config({ provider: 'facebook' }, helpers.getEnvVars('dev'));
      const authorizationToken = utils.createToken(payload, helpers.getEnvVars('dev').tokenSecret);
      const event = {
        type: 'TOKEN',
        authorizationToken,
        methodArn: 'arn:aws:execute-api:<regionId>:<accountId>:<apiId>/dev/<method>/<resourcePath>'
    };

      authorize(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.principalId).to.be.equal(payload.id);
      });
    });
  });
});

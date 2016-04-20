'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const nock = require('nock');
const expect = require('chai').expect;

describe('Authentication', () => {
  describe('Facebook', () => {
    before(() => {
      const providerConfig = config({ provider: 'facebook' });
      nock('https://graph.facebook.com')
        .get('/v2.3/oauth/access_token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://graph.facebook.com')
        .get('/me')
        .query({ access_token: 'access-token-123', fields: 'id,name,picture,email' })
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          email: 'email@test.com',
          picture: {
            data: {
              is_silhouette: false,
              url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
            }
          }
        });
    });

    it('should return oauth signin url', () => {
      const event = {
        provider: 'facebook'
      };

      lib.signinHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.url).to.equal('https://www.facebook.com/dialog/oauth?client_id=fb-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook&scope=email&state=state-facebook');
      });
    });

    it('should return local client url', (done) => {
      const event = {
        provider: 'facebook',
        code: 'code',
        state: 'state-facebook'
      };

      const providerConfig = config(event);
      lib.callbackHandler(event, (error, data) => {
        const token =
          data.url.match(/[a-zA-Z0-9-_]+?.[a-zA-Z0-9-_]+?.([a-zA-Z0-9-_]+)[a-zA-Z0-9-_]+?$/g)[0];
        const tokenData = utils.readToken(token, providerConfig.token_secret);
        expect(tokenData.id).to.equal(`${event.provider}-user-id-1`);
        done(error);
      });
    });
  });
});

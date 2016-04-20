'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const nock = require('nock');
const expect = require('chai').expect;

describe('Authentication', () => {
  describe('Microsoft', () => {
    before(() => {
      const providerConfig = config({ provider: 'microsoft' });
      nock('https://login.live.com')
        .post('/oauth20_token.srf')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://apis.live.net')
        .get('/v5.0/me')
        .query({ access_token: 'access-token-123' })
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          emails: {
            preferred: 'email@test.com'
          },
          picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        });
    });

    it('should return oauth signin url', () => {
      const event = {
        provider: 'microsoft'
      };

      lib.signinHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=ms-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic wl.emails&state=state-microsoft');
      });
    });

    it('should return local client url', (done) => {
      const event = {
        provider: 'microsoft',
        code: 'code',
        state: 'state-microsoft'
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

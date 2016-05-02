'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const nock = require('nock');
const expect = require('chai').expect;
const url = require('url');

describe('Authentication Provider', () => {
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

    let state = '';
    let refreshToken = '';

    it('should return oauth signin url', (done) => {
      const event = {
        provider: 'microsoft'
      };

      lib.signinHandler(event, (error, data) => {
        if (!error) {
          const query = url.parse(data.url, true).query;
          state = query.state;
          expect(error).to.be.null();
          expect(data.url).to.match(/https:\/\/login\.live\.com\/oauth20_authorize\.srf\?client_id=ms-mock-id&redirect_uri=https:\/\/api-id\.execute-api\.eu-west-1\.amazonaws\.com\/dev\/callback\/microsoft&response_type=code&scope=wl\.basic wl\.emails&state=.{64}/);
        }
        done(error);
      });
    });

    it('should return local client url', (done) => {
      const event = {
        provider: 'microsoft',
        code: 'code',
        state
      };

      const providerConfig = config(event);
      lib.callbackHandler(event, (error, data) => {
        if (!error) {
          const query = url.parse(data.url, true).query;
          refreshToken = query.refresh_token;
          expect(query.authorization_token).to.match(/[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?/);
          expect(refreshToken).to.match(/[A-Fa-f0-9]{64}/);
          const tokenData = utils.readToken(query.authorization_token, providerConfig.token_secret);
          expect(tokenData.id)
            .to.equal('0bc293b1bf8b932f7a996605f13aae28011f45a933abb48d10b693b8edfc5b34');
        }
        done(error);
      });
    });

    it('should get new authorization token', () => {
      const event = {
        refresh_token: refreshToken
      };

      lib.refreshHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.authorization_token).to.match(/[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?/);
        expect(data.refresh_token).to.match(/[A-Fa-f0-9]{64}/);
        expect(data.id).to.equal(event.id);
      });
    });
  });
});

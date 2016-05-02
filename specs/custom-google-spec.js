'use strict';

const lib = require('../authentication/lib');
const slsAuth = require('serverless-authentication');
const utils = slsAuth.utils;
const config = slsAuth.config;
const nock = require('nock');
const expect = require('chai').expect;
const url = require('url');

describe('Authentication Provider', () => {
  before(() => {
    const googleConfig = config({ provider: 'custom-google' });
    nock('https://www.googleapis.com')
      .post('/oauth2/v4/token')
      .query({
        client_id: googleConfig.id,
        redirect_uri: googleConfig.redirect_uri,
        client_secret: googleConfig.secret,
        code: 'code'
      })
      .reply(200, {
        access_token: 'access-token-123'
      });

    nock('https://www.googleapis.com')
      .get('/plus/v1/people/me')
      .query({ access_token: 'access-token-123' })
      .reply(200, {
        id: 'user-id-1',
        displayName: 'Eetu Tuomala',
        emails: [
          {
            value: 'email@test.com'
          }
        ],
        image: {
          url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        }
      });
  });

  describe('Custom Google', () => {
    let state = '';
    let refreshToken = '';
    it('should return oauth signin url', (done) => {
      const event = {
        provider: 'custom-google'
      };

      lib.signinHandler(event, (error, data) => {
        if (!error) {
          const query = url.parse(data.url, true).query;
          state = query.state;
          expect(error).to.be.null();
          expect(data.url).to.match(/https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?client_id=cg-mock-id&redirect_uri=https:\/\/api-id\.execute-api\.eu-west-1\.amazonaws\.com\/dev\/callback\/custom-google&response_type=code&scope=profile email&state=.{64}/);
        }
        done(error);
      });
    });

    it('should return local client url', (done) => {
      const event = {
        provider: 'custom-google',
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
            .to.equal('46344f93c18d9b70ddef7cc5c24886451a0af124f74d84a0c89387b5f7c70ff4');
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
      });
    });
  });
});

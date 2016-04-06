'use strict';

let assert = require('assert');
let lib = require('../authentication/lib');
let slsAuth = require('serverless-authentication');
let utils = slsAuth.utils;
let config = slsAuth.config;
let nock = require('nock');

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

  // describe('Callback', () => {
  //   before(() => {
  //
  //
  //
  //
  //     let customGoogleConfig = config('google');
  //     // custom-google
  //     nock('https://www.googleapis.com')
  //       .post('/oauth2/v4/token')
  //       .query({
  //         client_id: customGoogleConfig.id,
  //         redirect_uri: customGoogleConfig.redirect_uri,
  //         client_secret: customGoogleConfig.secret,
  //         code: 'code'
  //       })
  //       .reply(200, {
  //         access_token: 'access-token-123'
  //       });
  //
  //     nock('https://www.googleapis.com')
  //       .get('/plus/v1/people/me')
  //       .query({access_token: 'access-token-123'})
  //       .reply(200, {
  //         id: 'user-id-1',
  //         displayName: 'Eetu Tuomala',
  //         emails: [
  //           {
  //             value: 'email@test.com'
  //           }
  //         ],
  //         image: {
  //           url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
  //         }
  //       });
  //
  //   });
  //
  //   it('should return google url', (done) => {
  //     let event = {
  //       provider: 'google',
  //       code: 'code',
  //       state: 'state-google'
  //     };
  //
  //     lib.callback(event, (error, data) => {
  //       expect(error).to.be.null;
  //       expect(data.url).not.to.be.null;
  //       done(error);
  //     });
  //   });
  //
  //   it('should fail with incorrect state', (done) => {
  //     let event = {
  //       provider: 'google',
  //       code: 'code',
  //       state: 'state-google'
  //     };
  //
  //     lib.callback(event, (error, data) => {
  //       console.log(data.url);
  //       expect(error).to.be.null;
  //       expect(data.url).to.equal('http://localhost:3000/auth/google/?error=Unauthorized');
  //       done(error);
  //     });
  //   });
  // });
});
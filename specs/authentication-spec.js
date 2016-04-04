'use strict';

let assert = require('assert');
let lib = require('../authentication/lib');
let slsAuth = require('serverless-authentication');
let utils = slsAuth.utils;
let config = slsAuth.config;

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
    it('should return oauth signin url for facebook', () => {
      let event = {
        provider: 'facebook'
      };

      lib.signin(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.url).to.be.equal('https://www.facebook.com/dialog/oauth?client_id=fb-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook&scope=email&state=state-facebook');
      });
    });

    it('should return oauth signin url for google', () => {
      let event = {
        provider: 'google'
      };

      lib.signin(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.url).to.be.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=g-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=state-google');
      });
    });

    it('should return oauth signin url for microsoft', () => {
      let event = {
        provider: 'microsoft'
      };

      lib.signin(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.url).to.be.equal('https://login.live.com/oauth20_authorize.srf?client_id=ms-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic wl.emails&state=state-microsoft');
      });
    });


    it('should return oauth signin url for custom-google', () => {
      let event = {
        provider: 'custom-google'
      };

      lib.signin(event, (error, data) => {
        expect(error).to.be.null;
        expect(data.url).to.be.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=cg-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/custom-google&response_type=code&scope=profile email&state=state-custom-google');
      });
    });

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
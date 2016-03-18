"use strict";

let assert = require('assert');
let lib = require('../authentication/lib');
describe('Authentication', () => {
  describe('Authorize', () => {
    it('should return policy', () => {
      let event = {
        provider: 'facebook',
        authorizationToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE0NTgyODUxNTh9.rVA2-OAj7uBPAgLTOTWinj1cTCUUhXSM9HOnMzSueyQ'
      };
      lib.authorize(event, (error, data) => {
        expect(error).to.be.null;
      });
    });
  });
});
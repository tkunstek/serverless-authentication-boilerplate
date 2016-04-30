'use strict';

const lib = require('../authentication/lib');
const expect = require('chai').expect;

describe('Authentication', () => {
  describe('Signin', () => {
    it('should fail to return token for invalid provider', () => {
      const event = {
        provider: 'invalid'
      };
      lib.signinHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.url).to.equal('http://localhost:3000/auth/invalid/?error=Invalid provider');
      });
    });
  });
});

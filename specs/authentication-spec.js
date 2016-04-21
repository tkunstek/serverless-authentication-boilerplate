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

  describe('Refresh Token', () => {
    it('should get new authorization token', () => {
      const event = {
        refresh: '5165c43f29f6dc577e771d5ff837015c440990109452022dbe20816fbb1868d9'
      };
      lib.refreshHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.token).to.match(/[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?/);
        expect(data.refresh).to.match(/[A-Fa-f0-9]{64}/);
      });
    });
  });
});

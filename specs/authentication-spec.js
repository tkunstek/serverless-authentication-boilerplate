'use strict';

const signinHandler = require('../authentication/lib/handlers/signinHandler');
const expect = require('chai').expect;
const defaultEvent = require('./event.json');

describe('Authentication', () => {
  describe('Signin', () => {
    it('should fail to return token for invalid provider', (done) => {
      const event = Object.assign({}, defaultEvent, { provider: 'invalid' });

      signinHandler(event, (error, data) => {
        expect(error).to.be.null();
        expect(data.url).to.equal('http://127.0.0.1:3000/?error=Invalid provider: invalid');
        done(error);
      });
    });
  });
});

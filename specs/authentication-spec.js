'use strict';

const signinHandler = require('../authentication/lib/handlers/signinHandler');
const expect = require('chai').expect;

describe('Authentication', () => {
  describe('Signin', () => {
    it('should fail to return token for invalid provider', (done) => {
      const event = {
        provider: 'invalid',
        stage: 'dev',
        host: 'robot'
      };

      signinHandler(event, (error, data) => {
        console.log(data);
        expect(error).to.be.null();
        //expect(data.url).to.equal('http://127.0.0.1:3000/?error=Invalid provider: invalid');
        done(error);
      });
    });
  });
});

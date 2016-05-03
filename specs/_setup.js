'use strict';

const chai = require('chai');
const expect = chai.expect;
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
const dynamo = require('./dynamo');

process.env.PROVIDER_FACEBOOK_ID = 'fb-mock-id';
process.env.PROVIDER_FACEBOOK_SECRET = 'fb-mock-secret';

process.env.PROVIDER_GOOGLE_ID = 'g-mock-id';
process.env.PROVIDER_GOOGLE_SECRET = 'g-mock-secret';

process.env.PROVIDER_MICROSOFT_ID = 'ms-mock-id';
process.env.PROVIDER_MICROSOFT_SECRET = 'ms-mock-secret';

process.env.PROVIDER_CUSTOM_GOOGLE_ID = 'cg-mock-id';
process.env.PROVIDER_CUSTOM_GOOGLE_SECRET = 'cg-mock-secret';

process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/';
process.env.REDIRECT_URI = 'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}';
process.env.TOKEN_SECRET = 'token-secret-123';

chai.config.includeStack = false;

global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;

describe('Setup specs', () => {
  before((done) => dynamo.init(done));

  it('Local DynamoDB should be ready', () => {
    expect(dynamo.isReady()).to.be.true();
  });
});

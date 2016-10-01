'use strict';

const chai = require('chai');
const expect = chai.expect;
const dirtyChai = require('dirty-chai');
chai.use(dirtyChai);
const dynamo = require('./dynamo');

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

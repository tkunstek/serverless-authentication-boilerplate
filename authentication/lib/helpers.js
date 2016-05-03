'use strict';

function createResponseData(id) {
  // sets 15 seconds expiration time as an example
  const authorizationToken = {
    payload: {
      id
    },
    options: {
      expiresIn: 15
    }
  };

  return { authorizationToken };
}

exports = module.exports = {
  createResponseData
};

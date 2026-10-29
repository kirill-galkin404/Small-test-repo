var crypto = require('crypto');

// 64 hex characters from 32 random bytes; opaque to API clients.
function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = { makeToken: makeToken };

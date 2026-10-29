var md5 = require('md5');
var config = require('../config');

function hashPassword(pw) {
  return md5(pw + config.secret);
}

function makeToken(userId) {
  return md5(userId + '-' + Date.now() + '-' + Math.random());
}

module.exports = {
  hashPassword: hashPassword,
  makeToken: makeToken
};

var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var config = require('../config');

var BCRYPT_COST = 10;

function hashPassword(pw) {
  return bcrypt.hash(String(pw), BCRYPT_COST);
}

// bcrypt hashes start with "$2"; everything else is a legacy md5(pw + SECRET).
function isBcrypt(hash) {
  return typeof hash === 'string' && hash.indexOf('$2') === 0;
}

function legacyHash(pw) {
  return crypto.createHash('md5').update(String(pw) + config.secret).digest('hex');
}

// Resolves { ok, rehash }: rehash is true when the stored hash is legacy md5
// and the password matched, so the caller should store a bcrypt hash instead.
async function verifyPassword(pw, stored) {
  if (isBcrypt(stored)) {
    return { ok: await bcrypt.compare(String(pw), stored), rehash: false };
  }
  if (typeof stored !== 'string' || stored === '') {
    return { ok: false, rehash: false };
  }
  var a = Buffer.from(legacyHash(pw));
  var b = Buffer.from(stored);
  var ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  return { ok: ok, rehash: ok };
}

module.exports = { hashPassword: hashPassword, verifyPassword: verifyPassword, isBcrypt: isBcrypt };

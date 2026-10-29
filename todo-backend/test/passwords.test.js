// Exempt from the "no hash/token values" rule of the contract tests: this
// suite checks the storage format of passwords and tokens on purpose.
var test = require('node:test');
var assert = require('node:assert/strict');
var crypto = require('crypto');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

function legacyHash(pw) {
  return crypto.createHash('md5').update(pw + require('../config').secret).digest('hex');
}

test('seeded demo user has a bcrypt hash and still logs in', async function () {
  var row = await h.get('SELECT password FROM users WHERE username = ?', ['demo']);
  assert.match(row.password, /^\$2/);
  var res = await h.login('demo', 'demo');
  assert.equal(res.status, 200);
});

test('registered user gets a bcrypt hash', async function () {
  var u = await h.registerUser('bc');
  var row = await h.get('SELECT password FROM users WHERE username = ?', [u.username]);
  assert.match(row.password, /^\$2/);
  assert.equal((await h.login(u.username, u.password)).status, 200);
});

test('legacy md5 row logs in once and is rehashed to bcrypt', async function () {
  await h.run('INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, ?)',
    ['legacy', legacyHash('old-pw'), 'legacy@example.com', new Date().toISOString()]);

  var bad = await h.login('legacy', 'wrong');
  assert.equal(bad.status, 401);
  var untouched = await h.get('SELECT password FROM users WHERE username = ?', ['legacy']);
  assert.equal(untouched.password, legacyHash('old-pw'));

  var first = await h.login('legacy', 'old-pw');
  assert.equal(first.status, 200);
  assert.equal(first.body.user.password, undefined);
  var row = await h.get('SELECT password FROM users WHERE username = ?', ['legacy']);
  assert.match(row.password, /^\$2/);

  assert.equal((await h.login('legacy', 'old-pw')).status, 200);
  assert.equal((await h.login('legacy', 'wrong')).status, 401);
});

test('PUT /me stores a bcrypt hash and the new password works', async function () {
  var u = await h.registerUser('chg');
  var res = await h.request().put('/api/users/me').set('X-Auth-Token', u.token)
    .send({ email: 'new@example.com', password: 'brand-new' });
  assert.equal(res.status, 200);
  var row = await h.get('SELECT password FROM users WHERE username = ?', [u.username]);
  assert.match(row.password, /^\$2/);
  assert.equal((await h.login(u.username, 'brand-new')).status, 200);
  assert.equal((await h.login(u.username, u.password)).status, 401);
});

test('tokens are 64 hex chars and work via header and ?token', async function () {
  var token = await h.loginDemo();
  assert.match(token, /^[0-9a-f]{64}$/);
  var viaHeader = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(viaHeader.status, 200);
  var viaQuery = await h.request().get('/api/users/me').query({ token: token });
  assert.equal(viaQuery.status, 200);
  var u = await h.registerUser('tk');
  assert.match(u.token, /^[0-9a-f]{64}$/);
  assert.notEqual(u.token, token);
});

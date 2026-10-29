var test = require('node:test');
var assert = require('node:assert/strict');
var moment = require('moment');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

test('protected route without a token yields 401', async function () {
  var res = await h.request().get('/api/users/me');
  assert.equal(res.status, 401);
});

test('protected route with an unknown token yields 401', async function () {
  var res = await h.request().get('/api/users/me').set('X-Auth-Token', 'not-a-real-token');
  assert.equal(res.status, 401);
});

test('token is accepted from the X-Auth-Token header', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(res.status, 200);
  assert.equal(res.body.username, 'demo');
});

test('token is accepted from the ?token query parameter', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/users/me').query({ token: token });
  assert.equal(res.status, 200);
  assert.equal(res.body.username, 'demo');
  var raw = await h.request().get('/api/users/me?token=' + encodeURIComponent(token));
  assert.equal(raw.status, 200);
});

test('an expired token yields 401', async function () {
  var token = await h.loginDemo();
  var before = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(before.status, 200);

  await h.run('UPDATE tokens SET expires = ? WHERE token = ?',
    [moment().subtract(1, 'hours').format(), token]);

  var res = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(res.status, 401);
});

test('a token whose user no longer exists yields 401', async function () {
  var u = await h.registerUser('ghost');
  var ok = await h.request().get('/api/users/me').set('X-Auth-Token', u.token);
  assert.equal(ok.status, 200);

  await h.run('DELETE FROM users WHERE id = ?', [u.user.id]);

  var res = await h.request().get('/api/users/me').set('X-Auth-Token', u.token);
  assert.equal(res.status, 401);
});

test('logout deletes the presented token', async function () {
  var token = await h.loginDemo();
  var out = await h.request().post('/api/users/logout').set('X-Auth-Token', token);
  assert.equal(out.status, 200);
  assert.equal(out.body.ok, true);

  var res = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(res.status, 401);
});

test('logout accepts the token via ?token and invalidates it', async function () {
  var token = await h.loginDemo();
  var out = await h.request().post('/api/users/logout').query({ token: token });
  assert.equal(out.status, 200);
  var res = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(res.status, 401);
});

test('logout without a token yields 401', async function () {
  var res = await h.request().post('/api/users/logout');
  assert.equal(res.status, 401);
});

test('logout with a quoted/injection-style token is rejected and harms no other session', async function () {
  var good = await h.loginDemo();
  var res = await h.request().post('/api/users/logout').set('X-Auth-Token', "x' OR '1'='1");
  assert.equal(res.status, 401);
  var still = await h.request().get('/api/users/me').set('X-Auth-Token', good);
  assert.equal(still.status, 200);
});

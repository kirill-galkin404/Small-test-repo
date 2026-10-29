var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

test('logout with a quoted token is rejected and leaves other sessions alone', async function () {
  var other = await h.loginDemo();
  var evil = "x' OR '1'='1";

  var res = await h.request().post('/api/users/logout').set('X-Auth-Token', evil);
  assert.equal(res.status, 401);
  var viaQuery = await h.request().post('/api/users/logout').query({ token: evil });
  assert.equal(viaQuery.status, 401);

  var me = await h.request().get('/api/users/me').set('X-Auth-Token', other);
  assert.equal(me.status, 200);
  var remaining = await h.get('SELECT COUNT(*) AS n FROM tokens WHERE token = ?', [other]);
  assert.equal(remaining.n, 1);
});

test('logout deletes only the presented token', async function () {
  var first = await h.loginDemo();
  var second = await h.loginDemo();

  var out = await h.request().post('/api/users/logout').set('X-Auth-Token', first);
  assert.equal(out.status, 200);

  assert.equal((await h.request().get('/api/users/me').set('X-Auth-Token', first)).status, 401);
  assert.equal((await h.request().get('/api/users/me').set('X-Auth-Token', second)).status, 200);
});

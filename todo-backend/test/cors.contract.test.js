var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

test('Access-Control-Allow-Headers includes X-Auth-Token', async function () {
  var res = await h.request().get('/');
  assert.equal(res.status, 200);
  var allowed = res.headers['access-control-allow-headers'].toLowerCase();
  assert.ok(allowed.indexOf('x-auth-token') !== -1);
  assert.ok(allowed.indexOf('content-type') !== -1);
});

test('CORS allows any origin and the REST methods', async function () {
  var res = await h.request().get('/');
  assert.equal(res.headers['access-control-allow-origin'], '*');
  var methods = res.headers['access-control-allow-methods'];
  ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].forEach(function (m) {
    assert.ok(methods.indexOf(m) !== -1, m + ' missing from Allow-Methods');
  });
});

test('OPTIONS preflight answers 200 with CORS headers, without a token', async function () {
  var res = await h.request().options('/api/todos')
    .set('Origin', 'http://localhost:8080')
    .set('Access-Control-Request-Method', 'GET')
    .set('Access-Control-Request-Headers', 'X-Auth-Token');
  assert.equal(res.status, 200);
  assert.ok(res.headers['access-control-allow-headers'].toLowerCase().indexOf('x-auth-token') !== -1);
  assert.equal(res.headers['access-control-allow-origin'], '*');
});

test('OPTIONS on the users routes answers 200', async function () {
  var res = await h.request().options('/api/users/login');
  assert.equal(res.status, 200);
});

test('CORS headers are present on 401 responses too', async function () {
  var res = await h.request().get('/api/users/me');
  assert.equal(res.status, 401);
  assert.ok(res.headers['access-control-allow-headers'].toLowerCase().indexOf('x-auth-token') !== -1);
});

test('configured default port is 3000', function () {
  var config = require('../config');
  assert.equal(config.port, 3000);
});

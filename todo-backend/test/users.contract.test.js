var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

test('register without username or password yields 400', async function () {
  var a = await h.request().post('/api/users/register').send({ password: 'x' });
  assert.equal(a.status, 400);
  var b = await h.request().post('/api/users/register').send({ username: 'nopass' });
  assert.equal(b.status, 400);
  var c = await h.request().post('/api/users/register').send({});
  assert.equal(c.status, 400);
});

test('register with an existing username yields 409', async function () {
  var res = await h.request().post('/api/users/register').send({ username: 'demo', password: 'whatever' });
  assert.equal(res.status, 409);
});

test('register succeeds, returns token and user, and creates an Inbox list', async function () {
  var res = await h.request().post('/api/users/register')
    .send({ username: 'newbie', password: 'secret', email: 'newbie@example.com' });
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.token, 'string');
  assert.ok(res.body.token.length > 0);
  assert.equal(res.body.user.username, 'newbie');
  assert.equal(res.body.user.email, 'newbie@example.com');
  assert.ok(res.body.user.id);
  assert.equal('password' in res.body.user, false);

  var lists = await h.request().get('/api/lists').set('X-Auth-Token', res.body.token);
  assert.equal(lists.status, 200);
  var inbox = lists.body.filter(function (l) { return l.name === 'Inbox'; });
  assert.equal(inbox.length, 1);
  assert.equal(inbox[0].color, '#999999');

  var me = await h.request().get('/api/users/me').set('X-Auth-Token', res.body.token);
  assert.equal(me.status, 200);
  assert.equal(me.body.username, 'newbie');
});

test('login with demo/demo yields 200, a token and the user without password', async function () {
  var res = await h.login('demo', 'demo');
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.token, 'string');
  assert.ok(res.body.token.length > 0);
  assert.equal(res.body.user.username, 'demo');
  assert.equal('password' in res.body.user, false);
});

test('login with wrong password or unknown user yields 401', async function () {
  assert.equal((await h.login('demo', 'wrong')).status, 401);
  assert.equal((await h.login('nobody', 'demo')).status, 401);
});

test('each login issues a token that works independently', async function () {
  var t1 = (await h.login('demo', 'demo')).body.token;
  var t2 = (await h.login('demo', 'demo')).body.token;
  assert.equal((await h.request().get('/api/users/me').set('X-Auth-Token', t1)).status, 200);
  assert.equal((await h.request().get('/api/users/me').set('X-Auth-Token', t2)).status, 200);
});

test('GET /me returns the authenticated user shape', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/users/me').set('X-Auth-Token', token);
  assert.equal(res.status, 200);
  assert.equal(res.body.username, 'demo');
  assert.equal(res.body.email, 'demo@example.com');
  assert.ok(res.body.id);
  assert.ok(res.body.created_at);
  assert.equal('password' in res.body, false);
});

test('PUT /me updates email only when no password is supplied', async function () {
  var u = await h.registerUser('emailer');
  var res = await h.request().put('/api/users/me').set('X-Auth-Token', u.token)
    .send({ email: 'changed@example.com' });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);

  var me = await h.request().get('/api/users/me').set('X-Auth-Token', u.token);
  assert.equal(me.body.email, 'changed@example.com');
  assert.equal((await h.login(u.username, u.password)).status, 200);
});

test('PUT /me with a password changes the login password too', async function () {
  var u = await h.registerUser('pwchanger');
  var res = await h.request().put('/api/users/me').set('X-Auth-Token', u.token)
    .send({ email: 'pw@example.com', password: 'brand-new' });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);

  var me = await h.request().get('/api/users/me').set('X-Auth-Token', u.token);
  assert.equal(me.body.email, 'pw@example.com');
  assert.equal((await h.login(u.username, u.password)).status, 401);
  assert.equal((await h.login(u.username, 'brand-new')).status, 200);
});

test('PUT /me without a token yields 401', async function () {
  var res = await h.request().put('/api/users/me').send({ email: 'x@example.com' });
  assert.equal(res.status, 401);
});

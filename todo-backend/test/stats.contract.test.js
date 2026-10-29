var test = require('node:test');
var assert = require('node:assert/strict');
var moment = require('moment');
var helpers = require('./support/helpers');

// This file never mutates the seeded demo data, so the golden test sees the
// pristine seed. All mutating tests use freshly registered users.
var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

function auth(token) { return { 'X-Auth-Token': token }; }

test('GET /api/stats requires authentication', async function () {
  var res = await h.request().get('/api/stats');
  assert.equal(res.status, 401);
});

test('GET /api/stats for the seeded demo user returns the exact golden result', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/stats').set(auth(token));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    total: 8,
    done: 2,
    overdue: 1,
    dueToday: 1,
    tags: {
      shopping: 1,
      family: 1,
      report: 1,
      urgent: 1,
      dev: 2,
      'tech-debt': 1,
      repair: 1,
      bills: 1
    },
    percentDone: 25
  });
});

test('GET /api/stats accepts the token as a query parameter', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/stats').query({ token: token });
  assert.equal(res.status, 200);
  assert.equal(res.body.total, 8);
  assert.equal(res.body.percentDone, 25);
});

test('GET /api/stats for a user without todos is all zeros', async function () {
  var u = await h.registerUser('statsempty');
  var res = await h.request().get('/api/stats').set(auth(u.token));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { total: 0, done: 0, overdue: 0, dueToday: 0, tags: {}, percentDone: 0 });
});

test('GET /api/stats counts overdue, dueToday, tags and rounds percentDone', async function () {
  var u = await h.registerUser('statsmix');
  var today = moment().format('YYYY-MM-DD');
  var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
  var tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

  async function add(body) {
    var res = await h.request().post('/api/todos').set(auth(u.token)).send(body);
    assert.equal(res.status, 201);
    return res.body;
  }

  var late = await add({ title: 'late', due_date: yesterday, tags: ['a', 'b'] });
  await add({ title: 'today', due_date: today, tags: 'b, c' });
  await add({ title: 'later', due_date: tomorrow, tags: 'a' });
  var res1 = await h.request().put('/api/todos/' + late.id).set(auth(u.token)).send({ done: true });
  assert.equal(res1.status, 200);

  var res = await h.request().get('/api/stats').set(auth(u.token));
  assert.equal(res.status, 200);
  // the one past-due todo is done, so nothing is overdue; 1 of 3 done = 33%
  assert.deepEqual(res.body, {
    total: 3,
    done: 1,
    overdue: 0,
    dueToday: 1,
    tags: { a: 2, b: 2, c: 1 },
    percentDone: 33
  });

  await add({ title: 'also late', due_date: yesterday });
  var again = await h.request().get('/api/stats').set(auth(u.token));
  assert.equal(again.body.total, 4);
  assert.equal(again.body.overdue, 1);
  assert.equal(again.body.percentDone, 25);
});

test('GET /api/stats rounds percentDone to the nearest integer', async function () {
  var u = await h.registerUser('statsround');
  var ids = [];
  for (var i = 0; i < 3; i++) {
    var res = await h.request().post('/api/todos').set(auth(u.token)).send({ title: 'todo ' + i });
    ids.push(res.body.id);
  }
  await h.request().put('/api/todos/' + ids[0]).set(auth(u.token)).send({ done: true });
  await h.request().put('/api/todos/' + ids[1]).set(auth(u.token)).send({ done: true });
  var stats = await h.request().get('/api/stats').set(auth(u.token));
  assert.equal(stats.body.done, 2);
  assert.equal(stats.body.percentDone, 67);
});

test('GET /api/stats only counts the todos of the calling user', async function () {
  var a = await h.registerUser('statsa');
  var b = await h.registerUser('statsb');
  await h.request().post('/api/todos').set(auth(a.token)).send({ title: 'only a', tags: 'solo' });
  var res = await h.request().get('/api/stats').set(auth(b.token));
  assert.equal(res.body.total, 0);
  assert.deepEqual(res.body.tags, {});
});

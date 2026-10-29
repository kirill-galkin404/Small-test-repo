var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

// Read-only filter tests run against the seeded demo user; every mutating
// test registers its own fresh user, so the seed stays pristine.
var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

function auth(token) { return { 'X-Auth-Token': token }; }

function ids(body) { return body.map(function (t) { return t.id; }); }

async function createTodo(token, body) {
  var res = await h.request().post('/api/todos').set(auth(token)).send(body);
  assert.equal(res.status, 201);
  return res.body;
}

async function createList(token, name) {
  var res = await h.request().post('/api/lists').set(auth(token)).send({ name: name });
  assert.equal(res.status, 200);
  return res.body;
}

async function inboxId(token) {
  var lists = await h.request().get('/api/lists').set(auth(token));
  return lists.body.filter(function (l) { return l.name === 'Inbox'; })[0].id;
}

// ---------- GET /api/todos (seeded demo user, read only) ----------

test('GET /api/todos requires authentication', async function () {
  var res = await h.request().get('/api/todos');
  assert.equal(res.status, 401);
});

test('GET /api/todos returns all seeded todos newest first with formatted fields', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/todos').set(auth(token));
  assert.equal(res.status, 200);
  assert.deepEqual(ids(res.body), [8, 7, 6, 5, 4, 3, 2, 1]);

  var milk = res.body.filter(function (t) { return t.title === 'Buy milk'; })[0];
  assert.equal(milk.list_id, 1);
  assert.equal(milk.done, false);
  assert.equal(milk.priority, 1);
  assert.deepEqual(milk.tags, ['shopping']);
  assert.equal(typeof milk.created_at, 'string');
  assert.equal(typeof milk.updated_at, 'string');
  assert.ok(!milk.overdue, 'due today is not overdue');

  var report = res.body.filter(function (t) { return t.title === 'Finish quarterly report'; })[0];
  assert.equal(report.notes, 'needs numbers from finance');
  assert.deepEqual(report.tags, ['report', 'urgent']);
  assert.ok(report.overdue, 'past due and not done is overdue');

  var bill = res.body.filter(function (t) { return t.title === 'Pay electricity bill'; })[0];
  assert.equal(bill.done, true);
  assert.ok(!bill.overdue, 'a done todo is never overdue');

  var plants = res.body.filter(function (t) { return t.title === 'Water the plants'; })[0];
  assert.deepEqual(plants.tags, []);
  assert.equal(plants.due_date, null);
  assert.ok(!plants.overdue, 'no due date is not overdue');

  assert.equal(res.body.filter(function (t) { return t.overdue; }).length, 1);
});

test('GET /api/todos?list= filters by list', async function () {
  var token = await h.loginDemo();
  var work = await h.request().get('/api/todos').query({ list: 2 }).set(auth(token));
  assert.equal(work.status, 200);
  assert.deepEqual(ids(work.body), [5, 4, 3]);
  var inbox = await h.request().get('/api/todos').query({ list: 1 }).set(auth(token));
  assert.deepEqual(ids(inbox.body), [2, 1]);
});

test('GET /api/todos?done= filters by done state', async function () {
  var token = await h.loginDemo();
  var done = await h.request().get('/api/todos').query({ done: 1 }).set(auth(token));
  assert.deepEqual(ids(done.body), [7, 4]);
  var open = await h.request().get('/api/todos').query({ done: 0 }).set(auth(token));
  assert.deepEqual(ids(open.body), [8, 6, 5, 3, 2, 1]);
  var ignored = await h.request().get('/api/todos').query({ done: 'maybe' }).set(auth(token));
  assert.equal(ignored.body.length, 8);
});

test('GET /api/todos?q= searches title and notes', async function () {
  var token = await h.loginDemo();
  var title = await h.request().get('/api/todos').query({ q: 'milk' }).set(auth(token));
  assert.deepEqual(ids(title.body), [1]);
  var notes = await h.request().get('/api/todos').query({ q: 'finance' }).set(auth(token));
  assert.deepEqual(ids(notes.body), [3]);
  var none = await h.request().get('/api/todos').query({ q: 'no-such-text' }).set(auth(token));
  assert.equal(none.status, 200);
  assert.deepEqual(none.body, []);
});

test('GET /api/todos?tag= filters by tag', async function () {
  var token = await h.loginDemo();
  var dev = await h.request().get('/api/todos').query({ tag: 'dev' }).set(auth(token));
  assert.deepEqual(ids(dev.body), [5, 4]);
  var report = await h.request().get('/api/todos').query({ tag: 'report' }).set(auth(token));
  assert.deepEqual(ids(report.body), [3]);
});

test('GET /api/todos?sort=due orders by due date with undated todos last', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/todos').query({ sort: 'due' }).set(auth(token));
  assert.equal(res.status, 200);
  assert.deepEqual(ids(res.body).slice(0, 5), [7, 3, 1, 6, 5]);
  assert.equal(res.body.length, 8);
  res.body.slice(5).forEach(function (t) { assert.equal(t.due_date, null); });
});

test('GET /api/todos?sort=priority orders by priority descending', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/todos').query({ sort: 'priority' }).set(auth(token));
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 8);
  var priorities = res.body.map(function (t) { return t.priority; });
  for (var i = 1; i < priorities.length; i++) {
    assert.ok(priorities[i - 1] >= priorities[i], 'priorities not descending: ' + priorities);
  }
  assert.deepEqual(ids(res.body).slice(0, 2).sort(), [3, 7]);
});

test('GET /api/todos combines filters', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/todos').query({ list: 2, done: 0, tag: 'dev' }).set(auth(token));
  assert.deepEqual(ids(res.body), [5]);
});

test('GET /api/todos with an injection-style q never leaks other users todos', async function () {
  var token = await h.loginDemo();
  var other = await h.registerUser('injectother');
  await createTodo(other.token, { title: 'other users secret' });

  var res = await h.request().get('/api/todos').query({ q: "' OR '1'='1" }).set(auth(token));
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  res.body.forEach(function (t) {
    assert.notEqual(t.title, 'other users secret');
    assert.equal(t.user_id, 1);
  });

  var comment = await h.request().get('/api/todos').query({ q: "' OR 1=1 --" }).set(auth(token));
  assert.ok(comment.status === 200 || comment.status === 500, 'unexpected status ' + comment.status);
  if (comment.status === 200) {
    comment.body.forEach(function (t) { assert.notEqual(t.title, 'other users secret'); });
  }

  var tagged = await h.request().get('/api/todos').query({ tag: "' OR '1'='1" }).set(auth(token));
  assert.equal(tagged.status, 200);
  tagged.body.forEach(function (t) { assert.notEqual(t.title, 'other users secret'); });

  var after = await h.request().get('/api/todos').set(auth(token));
  assert.equal(after.body.length, 8);
});

// ---------- paging ----------

test('GET /api/todos pages results 20 at a time', async function () {
  var u = await h.registerUser('paging');
  var created = [];
  for (var i = 1; i <= 25; i++) {
    created.push((await createTodo(u.token, { title: 'paged ' + i })).id);
  }
  var newestFirst = created.slice().reverse();

  var p1 = await h.request().get('/api/todos').set(auth(u.token));
  assert.equal(p1.body.length, 20);
  assert.deepEqual(ids(p1.body), newestFirst.slice(0, 20));

  var p1b = await h.request().get('/api/todos').query({ page: 1 }).set(auth(u.token));
  assert.deepEqual(ids(p1b.body), ids(p1.body));

  var p2 = await h.request().get('/api/todos').query({ page: 2 }).set(auth(u.token));
  assert.equal(p2.status, 200);
  assert.deepEqual(ids(p2.body), newestFirst.slice(20));

  var p3 = await h.request().get('/api/todos').query({ page: 3 }).set(auth(u.token));
  assert.deepEqual(p3.body, []);

  var bad = await h.request().get('/api/todos').query({ page: 'abc' }).set(auth(u.token));
  assert.deepEqual(ids(bad.body), ids(p1.body));
});

// ---------- POST /api/todos ----------

test('POST /api/todos without a non-blank title yields 400', async function () {
  var u = await h.registerUser('postbad');
  assert.equal((await h.request().post('/api/todos').set(auth(u.token)).send({})).status, 400);
  assert.equal((await h.request().post('/api/todos').set(auth(u.token)).send({ title: '' })).status, 400);
  assert.equal((await h.request().post('/api/todos').set(auth(u.token)).send({ title: '   ' })).status, 400);
  var list = await h.request().get('/api/todos').set(auth(u.token));
  assert.deepEqual(list.body, []);
});

test('POST /api/todos applies defaults and files the todo into the Inbox', async function () {
  var u = await h.registerUser('postdefaults');
  var res = await h.request().post('/api/todos').set(auth(u.token)).send({ title: 'Plain todo' });
  assert.equal(res.status, 201);
  var t = res.body;
  assert.equal(typeof t.id, 'number');
  assert.equal(t.user_id, u.user.id);
  assert.equal(t.title, 'Plain todo');
  assert.equal(t.notes, '');
  assert.equal(t.done, false);
  assert.equal(t.priority, 2);
  assert.equal(t.due_date, null);
  assert.deepEqual(t.tags, []);
  assert.ok(!t.overdue);
  assert.equal(t.list_id, await inboxId(u.token));
  assert.equal(typeof t.created_at, 'string');
  assert.equal(typeof t.updated_at, 'string');
});

test('POST /api/todos stores supplied fields and joins tag arrays with commas', async function () {
  var u = await h.registerUser('postfull');
  var list = await createList(u.token, 'Custom');
  var t = await createTodo(u.token, {
    title: 'Full todo',
    notes: 'some notes',
    priority: 3,
    due_date: '2999-01-31',
    tags: ['x', 'y'],
    list_id: list.id
  });
  assert.equal(t.notes, 'some notes');
  assert.equal(t.priority, 3);
  assert.equal(t.due_date, '2999-01-31');
  assert.deepEqual(t.tags, ['x', 'y']);
  assert.equal(t.list_id, list.id);

  var raw = await h.get('SELECT tags FROM todos WHERE id = ?', [t.id]);
  assert.equal(raw.tags, 'x,y');

  var stringTags = await createTodo(u.token, { title: 'String tags', tags: 'p,q' });
  assert.deepEqual(stringTags.tags, ['p', 'q']);
});

test('a user without an Inbox gets todos with a null list', async function () {
  var u = await h.registerUser('noinbox');
  await h.run("DELETE FROM lists WHERE user_id = ?", [u.user.id]);
  var t = await createTodo(u.token, { title: 'Orphan' });
  assert.equal(t.list_id, null);
});

// ---------- GET /api/todos/:id ----------

test('GET /api/todos/:id returns an owned todo and 404 otherwise', async function () {
  var u = await h.registerUser('getone');
  var other = await h.registerUser('getother');
  var t = await createTodo(u.token, { title: 'Find me', tags: ['one'] });

  var res = await h.request().get('/api/todos/' + t.id).set(auth(u.token));
  assert.equal(res.status, 200);
  assert.equal(res.body.id, t.id);
  assert.equal(res.body.title, 'Find me');
  assert.deepEqual(res.body.tags, ['one']);
  assert.equal(res.body.done, false);

  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(other.token))).status, 404);
  assert.equal((await h.request().get('/api/todos/999999').set(auth(u.token))).status, 404);
});

// ---------- PUT /api/todos/:id ----------

test('PUT /api/todos/:id changes only supplied fields and refreshes updated_at', async function () {
  var u = await h.registerUser('put');
  var t = await createTodo(u.token, { title: 'Original', notes: 'keep me', priority: 3, tags: 'a,b', due_date: '2999-05-05' });
  await h.run("UPDATE todos SET updated_at = '2000-01-01T00:00:00+00:00' WHERE id = ?", [t.id]);

  var res = await h.request().put('/api/todos/' + t.id).set(auth(u.token)).send({ title: 'Renamed' });
  assert.equal(res.status, 200);
  assert.equal(res.body.id, t.id);
  assert.equal(res.body.title, 'Renamed');
  assert.equal(res.body.notes, 'keep me');
  assert.equal(res.body.priority, 3);
  assert.equal(res.body.due_date, '2999-05-05');
  assert.deepEqual(res.body.tags, ['a', 'b']);
  assert.equal(res.body.done, false);
  assert.equal(res.body.list_id, t.list_id);
  assert.notEqual(res.body.updated_at, '2000-01-01T00:00:00+00:00');
  assert.equal(res.body.created_at, t.created_at);

  var multi = await h.request().put('/api/todos/' + t.id).set(auth(u.token))
    .send({ done: true, priority: 1, notes: '', tags: ['z'], due_date: null });
  assert.equal(multi.status, 200);
  assert.equal(multi.body.done, true);
  assert.equal(multi.body.priority, 1);
  assert.equal(multi.body.notes, '');
  assert.deepEqual(multi.body.tags, ['z']);
  assert.equal(multi.body.due_date, null);
  assert.equal(multi.body.title, 'Renamed');

  var moved = await createList(u.token, 'Moved to');
  var mv = await h.request().put('/api/todos/' + t.id).set(auth(u.token)).send({ list_id: moved.id });
  assert.equal(mv.body.list_id, moved.id);
});

test('PUT /api/todos/:id yields 404 for missing or foreign todos and changes nothing', async function () {
  var owner = await h.registerUser('putowner');
  var other = await h.registerUser('putother');
  var t = await createTodo(owner.token, { title: 'Not yours' });

  var foreign = await h.request().put('/api/todos/' + t.id).set(auth(other.token)).send({ title: 'Hacked' });
  assert.equal(foreign.status, 404);
  var missing = await h.request().put('/api/todos/999999').set(auth(owner.token)).send({ title: 'x' });
  assert.equal(missing.status, 404);

  var check = await h.request().get('/api/todos/' + t.id).set(auth(owner.token));
  assert.equal(check.body.title, 'Not yours');
});

// ---------- toggle ----------

test('POST /api/todos/:id/toggle flips done back and forth', async function () {
  var u = await h.registerUser('toggle');
  var t = await createTodo(u.token, { title: 'Toggle me' });

  var first = await h.request().post('/api/todos/' + t.id + '/toggle').set(auth(u.token));
  assert.equal(first.status, 200);
  assert.deepEqual(first.body, { ok: true });
  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(u.token))).body.done, true);

  var second = await h.request().post('/api/todos/' + t.id + '/toggle').set(auth(u.token));
  assert.equal(second.status, 200);
  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(u.token))).body.done, false);
});

// ---------- DELETE ----------

test('DELETE /api/todos/:id removes an owned todo and 404s afterwards', async function () {
  var u = await h.registerUser('delete');
  var t = await createTodo(u.token, { title: 'Delete me' });

  var res = await h.request().delete('/api/todos/' + t.id).set(auth(u.token));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(u.token))).status, 404);
  assert.equal((await h.request().delete('/api/todos/' + t.id).set(auth(u.token))).status, 404);
});

test('DELETE /api/todos/:id yields 404 for another users todo and keeps it', async function () {
  var owner = await h.registerUser('delowner');
  var other = await h.registerUser('delother');
  var t = await createTodo(owner.token, { title: 'Survivor' });

  var res = await h.request().delete('/api/todos/' + t.id).set(auth(other.token));
  assert.equal(res.status, 404);
  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(owner.token))).status, 200);
});

// ---------- bulk ----------

test('POST /api/todos/bulk complete_all marks every todo of the list done', async function () {
  var u = await h.registerUser('bulkcomplete');
  var a = await createList(u.token, 'Bulk A');
  var b = await createList(u.token, 'Bulk B');
  await createTodo(u.token, { title: 'a1', list_id: a.id });
  await createTodo(u.token, { title: 'a2', list_id: a.id });
  await createTodo(u.token, { title: 'a3', list_id: a.id });
  await createTodo(u.token, { title: 'b1', list_id: b.id });

  var res = await h.request().post('/api/todos/bulk').set(auth(u.token))
    .send({ action: 'complete_all', list_id: a.id });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, changed: 3 });

  var inA = await h.request().get('/api/todos').query({ list: a.id }).set(auth(u.token));
  assert.equal(inA.body.length, 3);
  inA.body.forEach(function (t) { assert.equal(t.done, true); });
  var inB = await h.request().get('/api/todos').query({ list: b.id }).set(auth(u.token));
  assert.equal(inB.body.length, 1);
  assert.equal(inB.body[0].done, false);
});

test('POST /api/todos/bulk clear_done deletes only done todos of the list', async function () {
  var u = await h.registerUser('bulkclear');
  var a = await createList(u.token, 'Clear A');
  var b = await createList(u.token, 'Clear B');
  var a1 = await createTodo(u.token, { title: 'a1', list_id: a.id });
  var a2 = await createTodo(u.token, { title: 'a2', list_id: a.id });
  var b1 = await createTodo(u.token, { title: 'b1', list_id: b.id });
  await h.request().put('/api/todos/' + a1.id).set(auth(u.token)).send({ done: true });
  await h.request().put('/api/todos/' + b1.id).set(auth(u.token)).send({ done: true });

  var res = await h.request().post('/api/todos/bulk').set(auth(u.token))
    .send({ action: 'clear_done', list_id: a.id });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, changed: 1 });

  var inA = await h.request().get('/api/todos').query({ list: a.id }).set(auth(u.token));
  assert.deepEqual(ids(inA.body), [a2.id]);
  var inB = await h.request().get('/api/todos').query({ list: b.id }).set(auth(u.token));
  assert.deepEqual(ids(inB.body), [b1.id]);
});

test('POST /api/todos/bulk only affects todos of the calling user', async function () {
  var owner = await h.registerUser('bulkowner');
  var other = await h.registerUser('bulkother');
  var list = await createList(owner.token, 'Owners list');
  var t = await createTodo(owner.token, { title: 'owned', list_id: list.id });

  var res = await h.request().post('/api/todos/bulk').set(auth(other.token))
    .send({ action: 'complete_all', list_id: list.id });
  assert.equal(res.status, 200);
  assert.equal(res.body.changed, 0);
  assert.equal((await h.request().get('/api/todos/' + t.id).set(auth(owner.token))).body.done, false);
});

test('POST /api/todos/bulk with an unknown or missing action yields 400', async function () {
  var u = await h.registerUser('bulkbad');
  var list = await createList(u.token, 'Bad bulk');
  var unknown = await h.request().post('/api/todos/bulk').set(auth(u.token))
    .send({ action: 'explode', list_id: list.id });
  assert.equal(unknown.status, 400);
  var missing = await h.request().post('/api/todos/bulk').set(auth(u.token)).send({ list_id: list.id });
  assert.equal(missing.status, 400);
});

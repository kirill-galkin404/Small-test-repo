var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

function auth(token) { return { 'X-Auth-Token': token }; }

async function createList(token, body) {
  var res = await h.request().post('/api/lists').set(auth(token)).send(body);
  assert.equal(res.status, 200);
  return res.body;
}

async function createTodo(token, body) {
  var res = await h.request().post('/api/todos').set(auth(token)).send(body);
  assert.equal(res.status, 201);
  return res.body;
}

test('GET /api/lists requires authentication', async function () {
  var res = await h.request().get('/api/lists');
  assert.equal(res.status, 401);
});

test('GET /api/lists returns the seeded user lists with total and done counts', async function () {
  var token = await h.loginDemo();
  var res = await h.request().get('/api/lists').set(auth(token));
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  var summary = res.body.map(function (l) {
    return { name: l.name, color: l.color, total: l.total, done: l.done };
  });
  assert.deepEqual(summary, [
    { name: 'Inbox', color: '#999999', total: 2, done: 0 },
    { name: 'Work', color: '#d9534f', total: 3, done: 1 },
    { name: 'Home', color: '#5cb85c', total: 3, done: 1 }
  ]);
  res.body.forEach(function (l) {
    assert.equal(typeof l.id, 'number');
    assert.equal(typeof l.user_id, 'number');
    assert.equal(typeof l.created_at, 'string');
  });
});

test('GET /api/lists only returns the lists of the calling user', async function () {
  var u = await h.registerUser('listscope');
  var res = await h.request().get('/api/lists').set(auth(u.token));
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name, 'Inbox');
  assert.equal(res.body[0].total, 0);
  assert.equal(res.body[0].done, 0);
});

test('POST /api/lists without a name yields 400', async function () {
  var u = await h.registerUser('listnoname');
  var res = await h.request().post('/api/lists').set(auth(u.token)).send({ color: '#123456' });
  assert.equal(res.status, 400);
  var empty = await h.request().post('/api/lists').set(auth(u.token)).send({ name: '' });
  assert.equal(empty.status, 400);
});

test('POST /api/lists defaults the color to #337ab7 and returns the new list', async function () {
  var u = await h.registerUser('listdefault');
  var list = await createList(u.token, { name: 'Errands' });
  assert.equal(typeof list.id, 'number');
  assert.equal(list.name, 'Errands');
  assert.equal(list.color, '#337ab7');
  assert.equal(list.user_id, u.user.id);
  assert.equal(typeof list.created_at, 'string');

  var custom = await createList(u.token, { name: 'Colorful', color: '#ff0000' });
  assert.equal(custom.color, '#ff0000');

  var all = await h.request().get('/api/lists').set(auth(u.token));
  assert.deepEqual(all.body.map(function (l) { return l.name; }), ['Inbox', 'Errands', 'Colorful']);
});

test('PUT /api/lists/:id updates name and color of an owned list', async function () {
  var u = await h.registerUser('listput');
  var list = await createList(u.token, { name: 'Before' });
  var res = await h.request().put('/api/lists/' + list.id).set(auth(u.token))
    .send({ name: 'After', color: '#abcdef' });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });

  var all = await h.request().get('/api/lists').set(auth(u.token));
  var updated = all.body.filter(function (l) { return l.id === list.id; })[0];
  assert.equal(updated.name, 'After');
  assert.equal(updated.color, '#abcdef');
});

test('PUT /api/lists/:id does not change a list owned by another user', async function () {
  var owner = await h.registerUser('listowner');
  var other = await h.registerUser('listother');
  var list = await createList(owner.token, { name: 'Mine' });
  await h.request().put('/api/lists/' + list.id).set(auth(other.token))
    .send({ name: 'Hijacked', color: '#000000' });

  var all = await h.request().get('/api/lists').set(auth(owner.token));
  var unchanged = all.body.filter(function (l) { return l.id === list.id; })[0];
  assert.equal(unchanged.name, 'Mine');
  assert.equal(unchanged.color, '#337ab7');
});

test('list total and done counts follow its todos', async function () {
  var u = await h.registerUser('listcount');
  var list = await createList(u.token, { name: 'Counted' });
  var t1 = await createTodo(u.token, { title: 'one', list_id: list.id });
  await createTodo(u.token, { title: 'two', list_id: list.id });
  await h.request().put('/api/todos/' + t1.id).set(auth(u.token)).send({ done: true });

  var all = await h.request().get('/api/lists').set(auth(u.token));
  var counted = all.body.filter(function (l) { return l.id === list.id; })[0];
  assert.equal(counted.total, 2);
  assert.equal(counted.done, 1);
});

test('DELETE /api/lists/:id removes the list and cascades to its todos', async function () {
  var u = await h.registerUser('listdelete');
  var doomed = await createList(u.token, { name: 'Doomed' });
  var kept = await createList(u.token, { name: 'Kept' });
  var d1 = await createTodo(u.token, { title: 'doomed one', list_id: doomed.id });
  var d2 = await createTodo(u.token, { title: 'doomed two', list_id: doomed.id });
  var k1 = await createTodo(u.token, { title: 'kept one', list_id: kept.id });

  var res = await h.request().delete('/api/lists/' + doomed.id).set(auth(u.token));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });

  var all = await h.request().get('/api/lists').set(auth(u.token));
  assert.deepEqual(all.body.map(function (l) { return l.name; }), ['Inbox', 'Kept']);

  assert.equal((await h.request().get('/api/todos/' + d1.id).set(auth(u.token))).status, 404);
  assert.equal((await h.request().get('/api/todos/' + d2.id).set(auth(u.token))).status, 404);
  assert.equal((await h.request().get('/api/todos/' + k1.id).set(auth(u.token))).status, 200);
});

test('DELETE /api/lists/:id on the Inbox yields 400 and keeps it', async function () {
  var u = await h.registerUser('listinbox');
  var lists = await h.request().get('/api/lists').set(auth(u.token));
  var inbox = lists.body.filter(function (l) { return l.name === 'Inbox'; })[0];
  var inboxTodo = await createTodo(u.token, { title: 'stays in inbox' });
  assert.equal(inboxTodo.list_id, inbox.id);

  var res = await h.request().delete('/api/lists/' + inbox.id).set(auth(u.token));
  assert.equal(res.status, 400);

  var after = await h.request().get('/api/lists').set(auth(u.token));
  assert.equal(after.body.filter(function (l) { return l.name === 'Inbox'; }).length, 1);
  assert.equal((await h.request().get('/api/todos/' + inboxTodo.id).set(auth(u.token))).status, 200);
});

test('DELETE /api/lists/:id for a missing list yields 404', async function () {
  var u = await h.registerUser('listmissing');
  var res = await h.request().delete('/api/lists/999999').set(auth(u.token));
  assert.equal(res.status, 404);
});

test('DELETE /api/lists/:id with an injection-style id does not delete other lists', async function () {
  var u = await h.registerUser('listinject');
  var mine = await createList(u.token, { name: 'Injection target' });
  var before = await h.request().get('/api/lists').set(auth(u.token));

  var res = await h.request().delete('/api/lists/' + encodeURIComponent(mine.id + ' OR 1=1')).set(auth(u.token));
  assert.notEqual(res.status, 200);
  assert.ok(res.status === 400 || res.status === 404, 'unexpected status ' + res.status);

  var after = await h.request().get('/api/lists').set(auth(u.token));
  assert.equal(after.body.length, before.body.length);
  var demo = await h.request().get('/api/lists').set(auth(await h.loginDemo()));
  assert.equal(demo.body.length, 3);
});

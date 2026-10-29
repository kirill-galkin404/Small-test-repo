var test = require('node:test');
var assert = require('node:assert/strict');
var helpers = require('./support/helpers');

var h;
test.before(async function () { h = await helpers.createHarness(); });
test.after(async function () { await h.cleanup(); });

function auth(token) { return { 'X-Auth-Token': token }; }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

async function listWithTodos(u, name, titles) {
  var l = await h.request().post('/api/lists').set(auth(u.token)).send({ name: name });
  assert.equal(l.status, 200);
  for (var i = 0; i < titles.length; i++) {
    var t = await h.request().post('/api/todos').set(auth(u.token)).send({ title: titles[i], list_id: l.body.id });
    assert.equal(t.status, 201);
  }
  return l.body;
}

test('DELETE /api/lists/:id removes the list and its todos', async function () {
  var u = await h.registerUser('ldel');
  var list = await listWithTodos(u, 'Doomed', ['a', 'b']);
  var res = await h.request().delete('/api/lists/' + list.id).set(auth(u.token));
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal((await h.get('SELECT COUNT(*) AS c FROM todos WHERE list_id = ?', [list.id])).c, 0);
  assert.equal((await h.get('SELECT COUNT(*) AS c FROM lists WHERE id = ?', [list.id])).c, 0);
});

test('a failure while deleting the list rolls back the todo delete and returns 500', async function () {
  var u = await h.registerUser('lfail');
  var list = await listWithTodos(u, 'Sticky', ['keep 1', 'keep 2']);
  await h.run('CREATE TRIGGER fail_list_delete BEFORE DELETE ON lists ' +
    "BEGIN SELECT RAISE(ABORT, 'forced failure'); END");
  try {
    var res = await h.request().delete('/api/lists/' + list.id).set(auth(u.token));
    assert.equal(res.status, 500);
  } finally {
    await h.run('DROP TRIGGER fail_list_delete');
  }
  assert.equal((await h.get('SELECT COUNT(*) AS c FROM todos WHERE list_id = ?', [list.id])).c, 2);
  assert.equal((await h.get('SELECT COUNT(*) AS c FROM lists WHERE id = ?', [list.id])).c, 1);
  // the connection is usable again after the rollback
  var again = await h.request().get('/api/todos').query({ list: list.id }).set(auth(u.token));
  assert.equal(again.status, 200);
  assert.equal(again.body.length, 2);
});

test('concurrent todo insert waits for the list-delete transaction', async function () {
  var query = require('../lib/query');
  var u = await h.registerUser('lconc');
  var list = await listWithTodos(u, 'Busy', ['existing']);

  var release;
  var held = new Promise(function (resolve) { release = resolve; });
  var inTx = false;
  var txDone = query.withTransaction(async function (tx) {
    await tx.run('DELETE FROM todos WHERE list_id = ?', [list.id]);
    inTx = true;
    await held;
    throw new Error('roll back the list delete');
  });
  while (!inTx) await sleep(5);

  var settled = false;
  var insert = h.request().post('/api/todos').set(auth(u.token))
    .send({ title: 'inserted during delete', list_id: list.id })
    .then(function (res) { settled = true; return res; });

  await sleep(150);
  assert.equal(settled, false, 'insert must wait while the transaction is open');

  release();
  await assert.rejects(txDone, /roll back the list delete/);
  var res = await insert;
  assert.equal(res.status, 201);

  // the rolled-back delete left the old todo, and the waiting insert committed intact
  var rows = await h.request().get('/api/todos').query({ list: list.id }).set(auth(u.token));
  var titles = rows.body.map(function (t) { return t.title; }).sort();
  assert.deepEqual(titles, ['existing', 'inserted during delete']);
  assert.equal((await h.get('SELECT title FROM todos WHERE id = ?', [res.body.id])).title, 'inserted during delete');
});

test('query values are bound, not concatenated into SQL', async function () {
  var u = await h.registerUser('lbind');
  await h.request().post('/api/todos').set(auth(u.token)).send({ title: "o'brien", tags: ['x'] });
  var inj = await h.request().get('/api/todos').query({ list: '1 OR 1=1' }).set(auth(u.token));
  assert.equal(inj.status, 200);
  assert.deepEqual(inj.body, []);
  var q = await h.request().get('/api/todos').query({ q: "o'brien" }).set(auth(u.token));
  assert.equal(q.status, 200);
  assert.equal(q.body.length, 1);
});

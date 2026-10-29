process.env.DB_FILE = ':memory:';

var test = require('node:test');
var assert = require('node:assert');
var query = require('../lib/query');

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

test('run/get/all return promises with results', async function () {
  await query.run('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, v TEXT)');
  var r = await query.run('INSERT INTO t (v) VALUES (?)', ['a']);
  assert.strictEqual(r.lastID, 1);
  assert.strictEqual(r.changes, 1);
  assert.strictEqual((await query.get('SELECT v FROM t WHERE id = ?', [1])).v, 'a');
  assert.strictEqual((await query.all('SELECT * FROM t')).length, 1);
  await assert.rejects(query.get('SELECT * FROM missing_table'));
});

test('withTransaction commits and rolls back', async function () {
  await query.withTransaction(async function (tx) {
    await tx.run('INSERT INTO t (v) VALUES (?)', ['committed']);
  });
  assert.strictEqual((await query.all("SELECT * FROM t WHERE v = 'committed'")).length, 1);

  await assert.rejects(query.withTransaction(async function (tx) {
    await tx.run('INSERT INTO t (v) VALUES (?)', ['rolled-back']);
    throw new Error('boom');
  }), /boom/);
  assert.strictEqual((await query.all("SELECT * FROM t WHERE v = 'rolled-back'")).length, 0);
});

test('other callers wait for an active transaction to finish', async function () {
  var order = [];
  var inTx = query.withTransaction(async function (tx) {
    await tx.run('INSERT INTO t (v) VALUES (?)', ['pending']);
    await sleep(50);
    // reads inside the transaction see its own uncommitted write
    order.push('tx-inside:' + (await tx.all("SELECT * FROM t WHERE v = 'pending'")).length);
  });
  await sleep(5);
  var outside = query.all("SELECT * FROM t WHERE v = 'pending'").then(function (rows) {
    order.push('outside:' + rows.length);
  });
  await Promise.all([inTx, outside]);
  assert.deepStrictEqual(order, ['tx-inside:1', 'outside:1']);

  // a rolled back transaction is never visible to the queued caller
  var failing = query.withTransaction(async function (tx) {
    await tx.run('INSERT INTO t (v) VALUES (?)', ['ghost']);
    await sleep(30);
    throw new Error('nope');
  }).catch(function () {});
  await sleep(5);
  var rows = await query.all("SELECT * FROM t WHERE v = 'ghost'");
  await failing;
  assert.strictEqual(rows.length, 0);
});

test('concurrent transactions are serialised', async function () {
  var running = 0;
  var maxRunning = 0;
  function job() {
    return query.withTransaction(async function (tx) {
      running += 1;
      maxRunning = Math.max(maxRunning, running);
      await tx.run('INSERT INTO t (v) VALUES (?)', ['x']);
      await sleep(10);
      running -= 1;
    });
  }
  await Promise.all([job(), job(), job()]);
  assert.strictEqual(maxRunning, 1);
});

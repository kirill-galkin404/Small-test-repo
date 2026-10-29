// Promise wrappers around the shared sqlite connection.
//
// A transaction lives on the one shared connection, so while withTransaction
// is active every other caller of run/get/all waits until COMMIT/ROLLBACK.
// The callback given to withTransaction receives its own {run, get, all}
// bound to the transaction; those bypass the wait.
var db = require('./db');

var active = null; // promise that settles when the current transaction ends

function exec(method, sql, params) {
  return new Promise(function (resolve, reject) {
    if (method === 'run') {
      db.run(sql, params || [], function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    } else {
      db[method](sql, params || [], function (err, result) {
        if (err) return reject(err);
        resolve(result);
      });
    }
  });
}

// The statement is issued synchronously right after the idle check, so a
// transaction cannot begin in between.
async function guarded(method, sql, params) {
  while (active) {
    await active;
  }
  return exec(method, sql, params);
}

function run(sql, params) { return guarded('run', sql, params); }
function get(sql, params) { return guarded('get', sql, params); }
function all(sql, params) { return guarded('all', sql, params); }

async function withTransaction(fn) {
  while (active) {
    await active;
  }
  var release;
  active = new Promise(function (resolve) { release = resolve; });
  try {
    await exec('run', 'BEGIN');
    var result;
    try {
      result = await fn({
        run: function (sql, params) { return exec('run', sql, params); },
        get: function (sql, params) { return exec('get', sql, params); },
        all: function (sql, params) { return exec('all', sql, params); }
      });
    } catch (err) {
      await exec('run', 'ROLLBACK');
      throw err;
    }
    await exec('run', 'COMMIT');
    return result;
  } finally {
    active = null;
    release();
  }
}

module.exports = { run: run, get: get, all: all, withTransaction: withTransaction };

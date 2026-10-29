// Shared harness for the REST contract tests. Side-effect free on load:
// nothing happens until createHarness() is called.
var fs = require('fs');
var os = require('os');
var path = require('path');
var childProcess = require('child_process');
var request = require('supertest');
var sqlite3 = require('sqlite3');

var backendRoot = path.join(__dirname, '..', '..');

// The only place that knows how to obtain the express app. Repoint here if
// the app moves (e.g. to app.js).
function loadApp() {
  return require('../../server');
}

// Creates a temp SQLite file, seeds it with seed.js (demo / demo), points
// DB_FILE at it and loads the app. Must run before config/db/server are required.
async function createHarness() {
  var dir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-backend-test-'));
  var dbFile = path.join(dir, 'test.db');
  process.env.DB_FILE = dbFile;

  childProcess.execFileSync(process.execPath, [path.join(backendRoot, 'seed.js')], {
    cwd: backendRoot,
    env: Object.assign({}, process.env, { DB_FILE: dbFile }),
    stdio: 'pipe'
  });

  var app = loadApp();
  var rawDb = new sqlite3.Database(dbFile);

  function run(sql, params) {
    return new Promise(function (resolve, reject) {
      rawDb.run(sql, params || [], function (err) {
        if (err) reject(err); else resolve(this);
      });
    });
  }

  function get(sql, params) {
    return new Promise(function (resolve, reject) {
      rawDb.get(sql, params || [], function (err, row) {
        if (err) reject(err); else resolve(row);
      });
    });
  }

  async function login(username, password) {
    return request(app).post('/api/users/login').send({ username: username, password: password });
  }

  async function loginDemo() {
    var res = await login('demo', 'demo');
    if (res.status !== 200) throw new Error('demo login failed with status ' + res.status);
    return res.body.token;
  }

  var counter = 0;
  async function registerUser(prefix) {
    counter += 1;
    var username = (prefix || 'user') + '_' + process.pid + '_' + counter;
    var res = await request(app).post('/api/users/register')
      .send({ username: username, password: 'pw-' + username, email: username + '@example.com' });
    if (res.status !== 200) throw new Error('register failed with status ' + res.status);
    return { username: username, password: 'pw-' + username, token: res.body.token, user: res.body.user };
  }

  async function cleanup() {
    await new Promise(function (resolve) { rawDb.close(function () { resolve(); }); });
    try {
      var db = require('../../lib/db');
      await new Promise(function (resolve) { db.close(function () { resolve(); }); });
    } catch (e) { /* app db not loaded or already closed */ }
    fs.rmSync(dir, { recursive: true, force: true });
  }

  return {
    app: app,
    request: function () { return request(app); },
    login: login,
    loginDemo: loginDemo,
    registerUser: registerUser,
    run: run,
    get: get,
    cleanup: cleanup
  };
}

module.exports = { createHarness: createHarness };

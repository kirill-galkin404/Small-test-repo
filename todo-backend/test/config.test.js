var test = require('node:test');
var assert = require('node:assert');
var path = require('path');
var childProcess = require('child_process');

var configPath = path.join(__dirname, '..', 'config.js');
var VARS = ['PORT', 'SECRET', 'TOKEN_TTL_HOURS', 'PAGE_SIZE', 'ALLOW_ORIGIN', 'DB_FILE'];

// Loads config.js in a fresh process so env changes cannot leak between cases.
function loadConfig(env) {
  var clean = Object.assign({}, process.env);
  VARS.forEach(function (v) { delete clean[v]; });
  var out = childProcess.execFileSync(process.execPath,
    ['-e', 'process.stdout.write(JSON.stringify(require(' + JSON.stringify(configPath) + ')))'],
    { env: Object.assign(clean, env || {}), encoding: 'utf8' });
  return JSON.parse(out);
}

test('defaults match the previous hard-coded values', function () {
  var c = loadConfig();
  assert.strictEqual(c.port, 3000);
  assert.strictEqual(c.secret, 'supersecret123');
  assert.strictEqual(c.tokenTtlHours, 24);
  assert.strictEqual(c.pageSize, 20);
  assert.strictEqual(c.allowOrigin, '*');
  assert.strictEqual(c.dbFile, path.join(__dirname, '..', 'todo.db'));
});

test('each variable overrides its default', function () {
  var c = loadConfig({
    PORT: '4567',
    SECRET: 'another-secret',
    TOKEN_TTL_HOURS: '2',
    PAGE_SIZE: '5',
    ALLOW_ORIGIN: 'http://localhost:8080',
    DB_FILE: ':memory:'
  });
  assert.strictEqual(c.port, 4567);
  assert.strictEqual(c.secret, 'another-secret');
  assert.strictEqual(c.tokenTtlHours, 2);
  assert.strictEqual(c.pageSize, 5);
  assert.strictEqual(c.allowOrigin, 'http://localhost:8080');
  assert.strictEqual(c.dbFile, ':memory:');
});

test('non-numeric numeric variables fall back to defaults', function () {
  var c = loadConfig({ PORT: 'abc', TOKEN_TTL_HOURS: '', PAGE_SIZE: 'x' });
  assert.strictEqual(c.port, 3000);
  assert.strictEqual(c.tokenTtlHours, 24);
  assert.strictEqual(c.pageSize, 20);
});

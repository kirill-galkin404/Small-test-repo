'use strict';
// Behavior-locking tests for counter.js. Run: node tests/counter.test.js
// Optional: COUNTER_JS=/path/to/counter.js to test another copy.
const vm = require('node:vm');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const file = process.env.COUNTER_JS || path.join(__dirname, '..', 'counter.js');
const source = fs.readFileSync(file, 'utf8');

function load() {
  const elements = {};
  const warns = [];
  function el(id) {
    if (!elements[id]) {
      elements[id] = {
        innerHTML: '',
        style: {},
        handlers: {},
        addEventListener(type, fn) { this.handlers[type] = fn; },
      };
    }
    return elements[id];
  }
  const document = { getElementById: el };
  const consoleStub = { log() {}, warn(...args) { warns.push(args); }, error() {} };
  const ctx = vm.createContext({ document, console: consoleStub });
  vm.runInContext(source, ctx, { filename: file });
  return {
    ctx, warns, el,
    state: () => ({ c: vm.runInContext('c', ctx), cc: vm.runInContext('cc', ctx) }),
    ACTION: vm.runInContext('ACTION', ctx),
    dispatch: (x) => vm.runInContext('dispatch', ctx)(x),
    // Fake click event: target offers dataset.action and closest(sel) so it
    // works for both dataset-based and closest-based handlers.
    click(action) { el('counter').handlers.click(makeClick(action)); },
  };
}

function makeTarget(action) {
  const target = {
    dataset: action === undefined ? {} : { action },
    closest(sel) { return sel === '[data-action]' && action !== undefined ? target : null; },
  };
  return target;
}
function makeClick(action) { return { target: makeTarget(action) }; }

let failed = 0;
function test(name, fn) {
  try { fn(); console.log('ok - ' + name); }
  catch (e) { failed++; console.log('not ok - ' + name + '\n  ' + (e && e.stack || e)); }
}

test('registers a click listener on #counter', () => {
  const app = load();
  assert.strictEqual(typeof app.el('counter').handlers.click, 'function');
});

test('starts at 0 with cc 0', () => {
  const app = load();
  assert.deepStrictEqual(app.state(), { c: 0, cc: 0 });
});

test('INCREMENT adds 1', () => {
  const app = load(); app.click('INCREMENT');
  assert.deepStrictEqual(app.state(), { c: 1, cc: 1 });
  assert.strictEqual(String(app.el('d').innerHTML), '1');
});

test('DECREMENT subtracts 1 and allows negatives', () => {
  const app = load(); app.click('DECREMENT');
  assert.deepStrictEqual(app.state(), { c: -1, cc: 1 });
  assert.strictEqual(String(app.el('d').innerHTML), '-1');
});

test('ADD_FOUR adds 4', () => {
  const app = load(); app.click('ADD_FOUR');
  assert.strictEqual(app.state().c, 4);
});

test('DOUBLE doubles; DOUBLE then ADD_FOUR from 3 gives 6 then 10', () => {
  const app = load();
  for (let i = 0; i < 3; i++) app.click('INCREMENT');
  assert.strictEqual(app.state().c, 3);
  app.click('DOUBLE');
  assert.strictEqual(app.state().c, 6);
  assert.strictEqual(String(app.el('d').innerHTML), '6');
  app.click('ADD_FOUR');
  assert.strictEqual(app.state().c, 10);
  assert.strictEqual(String(app.el('d').innerHTML), '10');
});

test('RESET sets 0 but does not clear cc (cc rises)', () => {
  const app = load();
  app.click('ADD_FOUR'); app.click('DOUBLE');
  assert.deepStrictEqual(app.state(), { c: 8, cc: 2 });
  app.click('RESET');
  assert.deepStrictEqual(app.state(), { c: 0, cc: 3 });
  assert.strictEqual(String(app.el('d').innerHTML), '0');
  assert.strictEqual(app.el('ttl').innerHTML, 'Counter (3 clicks)');
});

test('dispatch RESET directly increments cc', () => {
  const app = load();
  app.dispatch(app.ACTION.RESET);
  assert.deepStrictEqual(app.state(), { c: 0, cc: 1 });
});

test('all five actions via direct dispatch', () => {
  const app = load();
  app.dispatch(app.ACTION.INCREMENT); assert.strictEqual(app.state().c, 1);
  app.dispatch(app.ACTION.DECREMENT); assert.strictEqual(app.state().c, 0);
  app.dispatch(app.ACTION.ADD_FOUR); assert.strictEqual(app.state().c, 4);
  app.dispatch(app.ACTION.DOUBLE); assert.strictEqual(app.state().c, 8);
  app.dispatch(app.ACTION.RESET); assert.strictEqual(app.state().c, 0);
  assert.strictEqual(app.state().cc, 5);
});

test('unrecognized dispatch is ignored with a warning and cc unchanged', () => {
  const app = load();
  app.click('INCREMENT');
  app.dispatch(999);
  assert.deepStrictEqual(app.state(), { c: 1, cc: 1 });
  assert.strictEqual(app.warns.length, 1);
  assert.strictEqual(app.el('ttl').innerHTML, 'Counter (1 clicks)');
});

test('unrecognized data-action name is ignored, cc unchanged', () => {
  const app = load();
  app.click('BOGUS');
  assert.deepStrictEqual(app.state(), { c: 0, cc: 0 });
  assert.strictEqual(app.warns.length, 1);
});

test('click without data-action is ignored silently', () => {
  const app = load();
  app.click(undefined);
  assert.deepStrictEqual(app.state(), { c: 0, cc: 0 });
  assert.strictEqual(app.warns.length, 0);
});

test('colour thresholds: >10 red, <0 blue, else black', () => {
  const app = load();
  const color = () => app.el('d').style.color;
  app.click('RESET'); assert.strictEqual(color(), 'black');
  app.click('DECREMENT'); assert.strictEqual(color(), 'blue');
  app.click('RESET');
  for (let i = 0; i < 10; i++) app.click('INCREMENT');
  assert.strictEqual(app.state().c, 10);
  assert.strictEqual(color(), 'black');
  app.click('INCREMENT');
  assert.strictEqual(app.state().c, 11);
  assert.strictEqual(color(), 'red');
  app.click('RESET'); assert.strictEqual(color(), 'black');
});

test('#ttl shows "Counter (N clicks)" after actions', () => {
  const app = load();
  app.click('INCREMENT'); app.click('DOUBLE');
  assert.strictEqual(app.el('ttl').innerHTML, 'Counter (2 clicks)');
});

test('counter is unbounded', () => {
  const app = load();
  for (let i = 0; i < 5; i++) app.click('ADD_FOUR');
  for (let i = 0; i < 5; i++) app.click('DOUBLE');
  assert.strictEqual(app.state().c, 20 * 32);
});

if (failed) { console.log(failed + ' test(s) failed'); process.exit(1); }
console.log('all tests passed');

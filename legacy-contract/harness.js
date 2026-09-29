// Characterization harness for legacy counter.js.
//
// Loads counter.js unmodified inside a Node `vm` context with a minimal
// DOM stub (fake `document.getElementById`), captures the click listener
// it registers on div#counter, then drives that listener directly to
// assert the exact behavior documented in legacy-contract/contract.md.
//
// Exits 0 iff every assertion passes; exits 1 and prints the first
// failure otherwise.

'use strict';

const vm = require('vm');
const fs = require('fs');
const path = require('path');

const counterSrc = fs.readFileSync(path.join(__dirname, '..', 'counter.js'), 'utf8');

function makeElement(id) {
  return {
    id: id,
    innerHTML: '',
    style: { color: '' },
    dataset: {},
  };
}

function makeSandbox() {
  const elements = {
    counter: makeElement('counter'),
    d: makeElement('d'),
    ttl: makeElement('ttl'),
  };

  let clickHandler = null;

  const counterEl = elements.counter;
  counterEl.addEventListener = function (type, handler) {
    if (type === 'click') {
      clickHandler = handler;
    }
  };

  const document = {
    getElementById: function (id) {
      if (!elements[id]) {
        throw new Error('unexpected getElementById(' + id + ')');
      }
      return elements[id];
    },
  };

  const sandbox = {
    document: document,
    console: console,
  };
  vm.createContext(sandbox);
  vm.runInContext(counterSrc, sandbox, { filename: 'counter.js' });

  if (typeof clickHandler !== 'function') {
    throw new Error('counter.js did not register a click handler on #counter');
  }

  return {
    sandbox: sandbox,
    elements: elements,
    click: function (action) {
      const event = { target: { dataset: {} } };
      if (action !== undefined) {
        event.target.dataset.action = action;
      }
      clickHandler(event);
    },
    getC: function () {
      return sandbox.c;
    },
    getCC: function () {
      return sandbox.cc;
    },
  };
}

// --- assertion helpers -------------------------------------------------

let failures = 0;
let assertions = 0;

function assertEqual(actual, expected, message) {
  assertions++;
  if (actual !== expected) {
    failures++;
    console.error(
      'FAIL: ' + message + ' — expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)
    );
  } else {
    console.log('ok: ' + message);
  }
}

// --- R-0008 / dispatch guard: no/unmapped action leaves c and cc unchanged ---

(function testDispatchGuard() {
  const h = makeSandbox();

  h.click(undefined); // no data-action at all
  assertEqual(h.getC(), 0, 'no data-action: c unchanged');
  assertEqual(h.getCC(), 0, 'no data-action: cc unchanged');
  assertEqual(h.elements.d.innerHTML, '', 'no data-action: render() not called (d.innerHTML untouched)');
  assertEqual(h.elements.ttl.innerHTML, '', 'no data-action: render() not called (ttl.innerHTML untouched)');

  h.click('NOT_A_REAL_ACTION'); // unmapped action -> ACTION[x] is undefined
  assertEqual(h.getC(), 0, 'unmapped data-action: c unchanged');
  assertEqual(h.getCC(), 0, 'unmapped data-action: cc unchanged');
  assertEqual(h.elements.d.innerHTML, '', 'unmapped data-action: render() not called (d.innerHTML untouched)');
})();

// --- R-0003 INCREMENT ---------------------------------------------------

(function testIncrement() {
  const h = makeSandbox();
  h.click('INCREMENT');
  assertEqual(h.getC(), 1, 'INCREMENT: c goes from 0 to 1');
  assertEqual(h.getCC(), 1, 'INCREMENT: cc incremented to 1');
  h.click('INCREMENT');
  assertEqual(h.getC(), 2, 'INCREMENT: c goes from 1 to 2');
  assertEqual(h.getCC(), 2, 'INCREMENT: cc incremented to 2');
})();

// --- R-0004 DECREMENT -----------------------------------------------------

(function testDecrement() {
  const h = makeSandbox();
  h.click('DECREMENT');
  assertEqual(h.getC(), -1, 'DECREMENT: c goes from 0 to -1');
  assertEqual(h.getCC(), 1, 'DECREMENT: cc incremented to 1');
})();

// --- R-0005 RESET (does not reset cc) --------------------------------

(function testReset() {
  const h = makeSandbox();
  h.click('INCREMENT');
  h.click('INCREMENT');
  h.click('INCREMENT');
  assertEqual(h.getC(), 3, 'RESET setup: c is 3 before reset');
  assertEqual(h.getCC(), 3, 'RESET setup: cc is 3 before reset');
  h.click('RESET');
  assertEqual(h.getC(), 0, 'RESET: c reset to 0');
  assertEqual(h.getCC(), 4, 'RESET: cc still increments (not reset) — now 4');
})();

// --- R-0006 ADD_FOUR ------------------------------------------------------

(function testAddFour() {
  const h = makeSandbox();
  h.click('ADD_FOUR');
  assertEqual(h.getC(), 4, 'ADD_FOUR: c goes from 0 to 4');
  assertEqual(h.getCC(), 1, 'ADD_FOUR: cc incremented to 1');
})();

// --- R-0007 DOUBLE ----------------------------------------------------

(function testDouble() {
  const h = makeSandbox();
  h.click('ADD_FOUR'); // c = 4
  h.click('DOUBLE'); // c = 8
  assertEqual(h.getC(), 8, 'DOUBLE: c doubles from 4 to 8');
  assertEqual(h.getCC(), 2, 'DOUBLE: cc incremented to 2');

  h.click('DECREMENT'); // c = 7
  h.click('DOUBLE'); // c = 14
  assertEqual(h.getC(), 14, 'DOUBLE: c doubles from 7 to 14');
})();

// --- R-0009 every recognized action increments cc by exactly 1 ---------

(function testClickCounting() {
  const h = makeSandbox();
  const sequence = ['INCREMENT', 'INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'];
  sequence.forEach(function (action, i) {
    h.click(action);
    assertEqual(h.getCC(), i + 1, 'sequence[' + i + ']=' + action + ': cc == ' + (i + 1));
  });
  // interleave an unmapped click: cc must not advance
  const ccBefore = h.getCC();
  h.click('BOGUS');
  assertEqual(h.getCC(), ccBefore, 'unmapped action mid-sequence: cc unchanged');
})();

// --- R-0001 render() color thresholds -----------------------------------

(function testColorThresholds() {
  const h = makeSandbox();

  // c == 0 -> black
  h.click('RESET');
  assertEqual(h.elements.d.style.color, 'black', 'color: c=0 -> black');

  // c == 10 -> not > 10 -> black (boundary check)
  for (let i = 0; i < 10; i++) h.click('INCREMENT');
  assertEqual(h.getC(), 10, 'boundary setup: c == 10');
  assertEqual(h.elements.d.style.color, 'black', 'color: c=10 -> black (boundary, not > 10)');

  // c == 11 -> red
  h.click('INCREMENT');
  assertEqual(h.getC(), 11, 'boundary setup: c == 11');
  assertEqual(h.elements.d.style.color, 'red', 'color: c=11 -> red (> 10)');

  // c == -1 -> blue
  h.click('RESET');
  h.click('DECREMENT');
  assertEqual(h.getC(), -1, 'boundary setup: c == -1');
  assertEqual(h.elements.d.style.color, 'blue', 'color: c=-1 -> blue (< 0)');

  // c == 0 again -> black
  h.click('INCREMENT');
  assertEqual(h.getC(), 0, 'boundary setup: c == 0 again');
  assertEqual(h.elements.d.style.color, 'black', 'color: c=0 -> black again');
})();

// --- R-0002 title format "Counter (N clicks)" ---------------------------

(function testTitleFormat() {
  const h = makeSandbox();
  h.click('INCREMENT');
  assertEqual(h.elements.ttl.innerHTML, 'Counter (1 clicks)', 'title: "Counter (1 clicks)" after 1 dispatch');
  h.click('DECREMENT');
  assertEqual(h.elements.ttl.innerHTML, 'Counter (2 clicks)', 'title: "Counter (2 clicks)" after 2 dispatches');
  h.click('BOGUS'); // does not count
  assertEqual(h.elements.ttl.innerHTML, 'Counter (2 clicks)', 'title: unmapped action does not bump click count');
  h.click('RESET');
  assertEqual(h.elements.ttl.innerHTML, 'Counter (3 clicks)', 'title: RESET still counts as a click (3)');
})();

// --- d.innerHTML mirrors c exactly ---------------------------------------

(function testDisplayMirrorsC() {
  const h = makeSandbox();
  h.click('ADD_FOUR');
  assertEqual(h.elements.d.innerHTML, h.getC(), 'display: d.innerHTML == c after ADD_FOUR');
  h.click('DOUBLE');
  assertEqual(h.elements.d.innerHTML, h.getC(), 'display: d.innerHTML == c after DOUBLE');
})();

// --- summary --------------------------------------------------------------

console.log('\n' + assertions + ' assertions, ' + failures + ' failed.');
process.exit(failures === 0 ? 0 : 1);

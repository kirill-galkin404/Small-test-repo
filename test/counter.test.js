"use strict";

// Minimal jsdom harness for counter.html. Loads the page's markup + inline
// script into a real jsdom window and drives doStuff(ACTION.X) directly,
// asserting #d innerHTML, #d style.color and #ttl innerHTML (cc) after
// each call.

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync(
  path.join(__dirname, "..", "counter.html"),
  "utf8"
);

let failures = 0;
let passed = 0;

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures++;
    console.error(
      `FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  } else {
    passed++;
    console.log(`ok: ${label}`);
  }
}

function freshWindow() {
  const dom = new JSDOM(html, { runScripts: "dangerously" });
  const window = dom.window;
  // ACTION is declared with `const` at the top level of the inline script,
  // so (per spec) it lives in the realm's global lexical environment and
  // is not exposed as a `window` property. `doStuff` is a function
  // declaration so it IS a window property. Read ACTION via eval so tests
  // can reference ACTION.* without needing to modify counter.html.
  window.ACTION = window.eval("ACTION");
  return window;
}

function state(window) {
  const d = window.document.getElementById("d");
  const ttl = window.document.getElementById("ttl");
  return {
    text: d.innerHTML,
    color: d.style.color,
    ttl: ttl.innerHTML,
  };
}

// --- INCREMENT: c increases, cc increases, color turns red once c>10 ---
(function testIncrement() {
  const window = freshWindow();
  for (let i = 0; i < 10; i++) {
    window.doStuff(window.ACTION.INCREMENT);
  }
  let s = state(window);
  assertEqual(s.text, "10", "INCREMENT x10: #d text");
  assertEqual(s.color, "black", "INCREMENT x10: #d color (c==10, not >10)");
  assertEqual(s.ttl, "Counter (10 clicks)", "INCREMENT x10: #ttl");

  window.doStuff(window.ACTION.INCREMENT);
  s = state(window);
  assertEqual(s.text, "11", "INCREMENT x11: #d text");
  assertEqual(s.color, "red", "INCREMENT x11: #d color (c>10)");
  assertEqual(s.ttl, "Counter (11 clicks)", "INCREMENT x11: #ttl");
})();

// --- DECREMENT: c decreases below 0, color turns blue, cc counts clicks ---
(function testDecrement() {
  const window = freshWindow();
  window.doStuff(window.ACTION.DECREMENT);
  let s = state(window);
  assertEqual(s.text, "-1", "DECREMENT x1: #d text");
  assertEqual(s.color, "blue", "DECREMENT x1: #d color (c<0)");
  assertEqual(s.ttl, "Counter (1 clicks)", "DECREMENT x1: #ttl");

  window.doStuff(window.ACTION.INCREMENT); // back to 0
  s = state(window);
  assertEqual(s.text, "0", "DECREMENT then INCREMENT: #d text");
  assertEqual(s.color, "black", "DECREMENT then INCREMENT: #d color");
  assertEqual(s.ttl, "Counter (2 clicks)", "DECREMENT then INCREMENT: #ttl");
})();

// --- Uniform color rule: blue applies whenever c<0, regardless of which
// action produced/left c negative — not just after DECREMENT. This is a
// deliberate consequence of Phase 2's unified render block (documented in
// counter.html), verified explicitly here since it differs from the
// pre-refactor behavior (only DECREMENT ever produced blue). ---
(function testBlueAppliesToAnyActionWhenNegative() {
  const window = freshWindow();
  for (let i = 0; i < 15; i++) {
    window.doStuff(window.ACTION.DECREMENT); // c=-15
  }
  window.doStuff(window.ACTION.INCREMENT); // c=-14, still negative
  const s = state(window);
  assertEqual(s.text, "-14", "INCREMENT while still negative: #d text");
  assertEqual(
    s.color,
    "blue",
    "INCREMENT while still negative: #d color is blue (uniform color rule, not DECREMENT-only)"
  );
  assertEqual(
    s.ttl,
    "Counter (16 clicks)",
    "INCREMENT while still negative: #ttl"
  );
})();

// --- RESET: c goes to 0, color black, cc untouched ---
(function testReset() {
  const window = freshWindow();
  for (let i = 0; i < 3; i++) {
    window.doStuff(window.ACTION.INCREMENT);
  }
  window.doStuff(window.ACTION.RESET);
  const s = state(window);
  assertEqual(s.text, "0", "RESET: #d text");
  assertEqual(s.color, "black", "RESET: #d color");
  assertEqual(s.ttl, "Counter (3 clicks)", "RESET: #ttl (cc unaffected by RESET)");
})();

// --- ADD_FIVE: regression check — turns red once c>10 (was missing before) ---
(function testAddFive() {
  const window = freshWindow();
  window.doStuff(window.ACTION.ADD_FIVE); // c=5
  let s = state(window);
  assertEqual(s.text, "5", "ADD_FIVE x1: #d text");
  assertEqual(s.color, "black", "ADD_FIVE x1: #d color (c<=10)");
  assertEqual(s.ttl, "Counter (1 clicks)", "ADD_FIVE x1: #ttl");

  window.doStuff(window.ACTION.ADD_FIVE); // c=10
  s = state(window);
  assertEqual(s.text, "10", "ADD_FIVE x2: #d text");
  assertEqual(s.color, "black", "ADD_FIVE x2: #d color (c==10)");

  window.doStuff(window.ACTION.ADD_FIVE); // c=15
  s = state(window);
  assertEqual(s.text, "15", "ADD_FIVE x3: #d text");
  assertEqual(
    s.color,
    "red",
    "ADD_FIVE x3: #d color turns red when c>10 (regression: was stuck black before)"
  );
  assertEqual(s.ttl, "Counter (3 clicks)", "ADD_FIVE x3: #ttl");
})();

// --- DOUBLE: per Phase 3 decision, DOUBLE increments cc like other
// non-RESET actions; verify c, color and cc together ---
(function testDouble() {
  const window = freshWindow();
  for (let i = 0; i < 6; i++) {
    window.doStuff(window.ACTION.INCREMENT); // c=6, cc=6
  }
  window.doStuff(window.ACTION.DOUBLE); // c=12, cc=7
  let s = state(window);
  assertEqual(s.text, "12", "DOUBLE: #d text");
  assertEqual(s.color, "red", "DOUBLE: #d color (c>10)");
  assertEqual(
    s.ttl,
    "Counter (7 clicks)",
    "DOUBLE: #ttl reflects cc incremented per Phase 3 decision"
  );
})();

console.log(`\n${passed} passed, ${failures} failed`);
if (failures > 0) {
  process.exit(1);
}

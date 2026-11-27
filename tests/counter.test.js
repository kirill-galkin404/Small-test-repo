"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { load } = require("./harness");

test("initial value and click count are 0", () => {
  const app = load();
  assert.strictEqual(app.value(), 0);
  assert.strictEqual(app.clicks(), 0);
});

test("one delegated listener; ACTION has ADD_FIVE and keeps ids 1-5", () => {
  const app = load();
  assert.strictEqual(app.listenerCount(), 1);
  const a = app.ACTION();
  assert.deepStrictEqual(
    [a.INCREMENT, a.DECREMENT, a.RESET, a.ADD_FOUR, a.DOUBLE, a.ADD_FIVE],
    [1, 2, 3, 4, 5, 6]
  );
});

for (const [start, expected] of [[0, 5], [3, 8], [-2, 3]]) {
  test("ADD_FIVE takes " + start + " to " + expected, () => {
    const app = load();
    app.set(start);
    app.click("ADD_FIVE");
    assert.strictEqual(app.value(), expected);
  });
}

test("ADD_FIVE increases value from 0 to 5", () => {
  const app = load();
  app.click("ADD_FIVE");
  assert.strictEqual(app.value(), 5);
});

test("existing actions keep their effects", () => {
  const app = load();
  app.click("INCREMENT");
  assert.strictEqual(app.value(), 1);
  app.click("DECREMENT");
  app.click("DECREMENT");
  assert.strictEqual(app.value(), -1);
  app.click("ADD_FOUR");
  assert.strictEqual(app.value(), 3);
  app.click("DOUBLE");
  assert.strictEqual(app.value(), 6);
  app.click("RESET");
  assert.strictEqual(app.value(), 0);
  assert.strictEqual(app.clicks(), 6);
});

test("ADD_FIVE counts a click, updates the title and renders", () => {
  const app = load();
  app.click("ADD_FIVE");
  assert.strictEqual(app.clicks(), 1);
  assert.strictEqual(app.el("ttl").innerHTML, "Counter (1 clicks)");
  assert.strictEqual(app.el("d").innerHTML, 5);
});

test("unknown or missing actions change nothing", () => {
  const app = load();
  app.click("NOPE");
  app.clickPlain();
  app.dispatch(99);
  assert.strictEqual(app.value(), 0);
  assert.strictEqual(app.clicks(), 0);
  assert.strictEqual(app.el("ttl").innerHTML, "");
  assert.ok(app.logs.warn.length >= 2);
});

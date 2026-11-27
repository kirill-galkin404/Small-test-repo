"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { load } = require("./harness");

const html = fs.readFileSync(path.join(__dirname, "..", "counter.html"), "utf8");
const counterDiv = html.match(/<div id="counter">([\s\S]*?)<\/div>/);
const buttons = counterDiv
  ? Array.from(counterDiv[1].matchAll(/<button data-action="([A-Z_]+)">([^<]*)<\/button>/g)).map((m) => [m[1], m[2]])
  : [];

test("counter.html has six buttons inside #counter, existing five unchanged, +5 last", () => {
  assert.deepStrictEqual(buttons, [
    ["INCREMENT", "+"],
    ["DECREMENT", "-"],
    ["RESET", "reset"],
    ["ADD_FOUR", "+4"],
    ["DOUBLE", "x2"],
    ["ADD_FIVE", "+5"],
  ]);
  assert.strictEqual((html.match(/data-action="ADD_FIVE"/g) || []).length, 1);
});

const expected = {
  INCREMENT: [3, 4],
  DECREMENT: [3, 2],
  RESET: [3, 0],
  ADD_FOUR: [3, 7],
  DOUBLE: [3, 6],
  ADD_FIVE: [3, 8],
};

for (const [action] of buttons) {
  test("clicking " + action + " drives counter.js", () => {
    const [start, end] = expected[action];
    const app = load();
    app.set(start);
    app.click(action);
    assert.strictEqual(app.value(), end);
    assert.strictEqual(app.clicks(), 1);
  });
}

'use strict';

// Interim, architecture-coupled test: this suite parses counter.html's
// inline <script> (the ACTION enum + doOperation's switch) and its inline
// onclick="..." button markup directly via acorn, asserting that the
// ACTION keys, the action tokens dispatched by each button's onclick
// handler, and the case labels handled in doOperation's switch are all
// mutually consistent -- plus that each button's visible label matches
// the arithmetic its switch case actually performs.
//
// This test is coupled to the CURRENT architecture (a global ACTION enum,
// inline onclick="..." handlers, and a doOperation switch statement) and
// will need to be rewritten if either of these in-flight plans lands:
//   1. "Replace inline onclick wiring with addEventListener + data-action
//      dispatch" -- removes the onclick="..." surface this test parses.
//   2. A future data-driven button-config refactor -- removes the
//      standalone ACTION enum / switch statement entirely.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');

const {
  getActionKeys,
  getSwitchCaseActions,
  getSwitchCaseArithmetic,
  deriveExpectedLabel,
  getButtonHandlers,
} = require('./extract');

const HTML_PATH = path.join(__dirname, '..', '..', 'counter.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

const scriptMatch = /<script>([\s\S]*?)<\/script>/i.exec(html);
assert.ok(scriptMatch, 'expected an inline <script> block in counter.html');
const scriptAst = acorn.parse(scriptMatch[1], { ecmaVersion: 2022 });

test('ACTION keys, button handler tokens, and switch-case tokens are mutually consistent', () => {
  const actionKeys = getActionKeys(scriptAst).slice().sort();
  const handlerActions = getButtonHandlers(html)
    .map((h) => h.action)
    .sort();
  const switchActions = getSwitchCaseActions(scriptAst).slice().sort();

  assert.deepStrictEqual(handlerActions, actionKeys, 'button onclick action tokens must match ACTION keys');
  assert.deepStrictEqual(switchActions, actionKeys, 'switch-case action tokens must match ACTION keys');
});

test('each button label matches the arithmetic its switch case performs', () => {
  const handlersByAction = new Map(getButtonHandlers(html).map((h) => [h.action, h.label]));
  const arithmeticByAction = getSwitchCaseArithmetic(scriptAst);

  for (const { action, arith } of arithmeticByAction) {
    const expectedLabel = deriveExpectedLabel(arith);
    const actualLabel = handlersByAction.get(action);
    assert.equal(
      actualLabel,
      expectedLabel,
      `button label for ACTION.${action} should be '${expectedLabel}' (derived from its switch-case arithmetic) but was '${actualLabel}'`
    );
  }
});

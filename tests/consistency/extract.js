'use strict';

const acorn = require('acorn');

function findFreezeObjectArg(init) {
  if (
    init.type === 'CallExpression' &&
    init.callee.type === 'MemberExpression' &&
    init.callee.object.type === 'Identifier' &&
    init.callee.object.name === 'Object' &&
    init.callee.property.type === 'Identifier' &&
    init.callee.property.name === 'freeze' &&
    init.arguments.length === 1 &&
    init.arguments[0].type === 'ObjectExpression'
  ) {
    return init.arguments[0];
  }
  return null;
}

// Returns the keys of `const ACTION = Object.freeze({ ... })` from the
// parsed inline-script AST.
function getActionKeys(scriptAst) {
  for (const node of scriptAst.body) {
    if (node.type !== 'VariableDeclaration') continue;
    for (const decl of node.declarations) {
      if (decl.id.type === 'Identifier' && decl.id.name === 'ACTION' && decl.init) {
        const objExpr = findFreezeObjectArg(decl.init);
        if (objExpr) {
          return objExpr.properties.map((p) => p.key.name);
        }
      }
    }
  }
  throw new Error('ACTION = Object.freeze({...}) declaration not found');
}

function findFunctionDeclaration(scriptAst, name) {
  for (const node of scriptAst.body) {
    if (node.type === 'FunctionDeclaration' && node.id && node.id.name === name) {
      return node;
    }
  }
  return null;
}

function findSwitchStatement(fnBody) {
  for (const stmt of fnBody.body) {
    if (stmt.type === 'SwitchStatement') return stmt;
  }
  return null;
}

function getDoOperationSwitch(scriptAst) {
  const fn = findFunctionDeclaration(scriptAst, 'doOperation');
  if (!fn) throw new Error('doOperation function not found');
  const switchStmt = findSwitchStatement(fn.body);
  if (!switchStmt) throw new Error('switch statement not found in doOperation');
  return switchStmt;
}

// Walks doOperation's SwitchStatement, excluding `default`, returning the
// ACTION.X token name dispatched by each case (`case ACTION.X:`).
function getSwitchCaseActions(scriptAst) {
  const switchStmt = getDoOperationSwitch(scriptAst);
  const actions = [];
  for (const c of switchStmt.cases) {
    if (c.test === null) continue; // default
    if (c.test.type === 'MemberExpression' && c.test.property && c.test.property.name) {
      actions.push(c.test.property.name);
    }
  }
  return actions;
}

// For each non-default case in doOperation's switch, inspects the case
// body's assignment expressions to determine the arithmetic it performs:
//   - a bare literal-0 assignment (e.g. `c = 0`) -> { operator: 'reset' }
//   - an assignment whose right-hand side is a BinaryExpression with a
//     +, -, or * operator against a numeric Literal (possibly via an
//     intermediate `temp` variable) -> { operator, value }
function getSwitchCaseArithmetic(scriptAst) {
  const switchStmt = getDoOperationSwitch(scriptAst);
  const results = [];
  for (const c of switchStmt.cases) {
    if (c.test === null) continue; // default
    const action = c.test.property.name;
    let resetSeen = false;
    let binary = null;
    for (const stmt of c.consequent) {
      if (stmt.type !== 'ExpressionStatement') continue;
      const expr = stmt.expression;
      if (expr.type !== 'AssignmentExpression' || expr.operator !== '=') continue;
      const right = expr.right;
      if (right.type === 'Literal' && typeof right.value === 'number') {
        if (right.value === 0) resetSeen = true;
        continue;
      }
      if (right.type === 'BinaryExpression' && ['+', '-', '*'].includes(right.operator)) {
        const literalSide =
          right.left.type === 'Literal' && typeof right.left.value === 'number'
            ? right.left
            : right.right.type === 'Literal' && typeof right.right.value === 'number'
            ? right.right
            : null;
        if (literalSide) {
          binary = { operator: right.operator, value: literalSide.value };
        }
      }
    }
    const arith = binary || (resetSeen ? { operator: 'reset' } : null);
    results.push({ action, arith });
  }
  return results;
}

// Given an arithmetic descriptor from getSwitchCaseArithmetic, derives the
// expected visible button label.
function deriveExpectedLabel(arith) {
  if (!arith) return null;
  if (arith.operator === 'reset') return 'reset';
  if (arith.operator === '*') return 'x' + arith.value;
  if (arith.value === 1) return arith.operator; // '+' or '-'
  return arith.operator + arith.value;
}

const BUTTON_RE = /<button\b([^>]*)>([^<]*)<\/button>/gi;
const ONCLICK_RE = /onclick\s*=\s*"([^"]*)"/i;

// Isolates each `<button onclick="...">label</button>` in the raw HTML,
// parsing the onclick attribute's expression with acorn (not string
// matching) to pull the dispatched ACTION token, alongside the raw
// visible label text.
function getButtonHandlers(html) {
  const handlers = [];
  let match;
  BUTTON_RE.lastIndex = 0;
  while ((match = BUTTON_RE.exec(html)) !== null) {
    const attrs = match[1];
    const label = match[2].trim();
    const onclickMatch = ONCLICK_RE.exec(attrs);
    if (!onclickMatch) continue;

    const expr = acorn.parseExpressionAt(onclickMatch[1], 0, { ecmaVersion: 2022 });
    if (expr.type !== 'CallExpression' || expr.arguments.length !== 1) {
      throw new Error(`Unexpected onclick expression: ${onclickMatch[1]}`);
    }
    const arg = expr.arguments[0];
    if (arg.type !== 'MemberExpression' || !arg.property || !arg.property.name) {
      throw new Error(`Unexpected onclick argument: ${onclickMatch[1]}`);
    }
    handlers.push({ action: arg.property.name, label });
  }
  return handlers;
}

module.exports = {
  getActionKeys,
  getSwitchCaseActions,
  getSwitchCaseArithmetic,
  deriveExpectedLabel,
  getButtonHandlers,
};

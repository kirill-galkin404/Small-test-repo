import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ACTIONS, thresholds, titleFor } from './rules.js';

const doc = readFileSync(resolve(process.cwd(), 'RULES.md'), 'utf8');

const RULE_KEYS = [
  'counter-app.unrecognized-action-ignored',
  'counter-app.click-count-semantics',
  'counter-app.increment-decrement',
  'counter-app.reset-to-zero',
  'counter-app.add-four',
  'counter-app.double',
  'counter-app.value-colour-thresholds',
];

describe('RULES.md matches src/rules.js', () => {
  it('mentions every action', () => {
    for (const key of Object.keys(ACTIONS)) expect(doc).toContain(key);
  });
  it('mentions every rule key', () => {
    for (const key of RULE_KEYS) expect(doc).toContain(key);
  });
  it('states each threshold', () => {
    expect(doc).toContain(`thresholds.high\` = ${thresholds.high}`);
    expect(doc).toContain(`thresholds.low\` = ${thresholds.low}`);
  });
  it('uses the title wording', () => {
    expect(doc).toContain(titleFor(1));
    expect(doc).toContain(titleFor(0));
    expect(doc).toContain('Counter (N clicks)');
  });
  it('records the quirk decisions and their status', () => {
    expect(doc).toContain('Quirk decisions');
    expect(doc).toContain('Recommended default, pending operator confirmation');
  });
});

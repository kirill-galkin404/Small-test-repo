import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(import.meta.dirname, '../style.css'), 'utf8');

const rule = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match && match[1];
};

describe('style.css', () => {
  for (const action of ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE']) {
    it(`has a rule for ${action} with padding, background and white text`, () => {
      const body = rule(`button[data-action="${action}"]`);
      expect(body).not.toBeNull();
      expect(body).toMatch(/padding:\s*10px/);
      expect(body).toMatch(/background:\s*[^;]+;/);
      expect(body).toMatch(/color:\s*white/);
    });
  }

  it('keeps the #d rule with default colour black', () => {
    expect(rule('#d')).toMatch(/color:\s*black/);
  });
});

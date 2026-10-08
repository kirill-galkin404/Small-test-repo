import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const cssPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'counter.css');
const css = readFileSync(cssPath, 'utf8');

const vars = {};
for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();

const REQUIRED = [
  'bg', 'fg', 'tone-high', 'tone-neutral', 'tone-low', 'btn-fg',
  'btn-increment', 'btn-decrement', 'btn-reset', 'btn-add-four', 'btn-double',
];
const BUTTONS = ['btn-increment', 'btn-decrement', 'btn-reset', 'btn-add-four', 'btn-double'];

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('theme', () => {
  it.each(REQUIRED)('defines --%s as 6-digit hex', (name) => {
    expect(vars[name], `missing --${name}`).toBeDefined();
    expect(vars[name]).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it.each(['fg', 'tone-high', 'tone-low', 'tone-neutral'])('--%s has contrast >= 4.5 against --bg', (name) => {
    expect(contrast(vars[name], vars.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(BUTTONS)('--%s background has contrast >= 4.5 against --btn-fg', (name) => {
    expect(contrast(vars[name], vars['btn-fg'])).toBeGreaterThanOrEqual(4.5);
  });

  it.each([...BUTTONS.map((b) => `.${b}`), '.value--high', '.value--low', '.value--neutral'])(
    'declares class selector %s',
    (sel) => {
      const re = new RegExp(sel.replace(/\./g, '\\.') + '\\b');
      expect(css).toMatch(re);
    },
  );

  it('--tone-high is red-family', () => {
    const [r, g, b] = rgb(vars['tone-high']);
    expect(r).toBeGreaterThanOrEqual(Math.max(g, b));
    expect(r - g).toBeGreaterThanOrEqual(40);
    expect(r - b).toBeGreaterThanOrEqual(40);
  });

  it('--tone-low is blue-family', () => {
    const [r, g, b] = rgb(vars['tone-low']);
    expect(b).toBeGreaterThanOrEqual(Math.max(r, g));
    expect(b).toBeGreaterThan(r);
  });

  it('uses a dark color scheme and never black text', () => {
    expect(css).toMatch(/color-scheme:\s*dark/);
    expect(css).not.toMatch(/(^|[^-\w])color:\s*black/);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveInitialTheme, getSystemTheme, applyTheme, THEME_KEY } from './theme.js';

function stubSystem(dark) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: dark && query.includes('dark'),
    media: query,
  }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('initial theme', () => {
  it('defaults to light when matchMedia is unavailable', () => {
    expect(typeof window.matchMedia).not.toBe('function');
    expect(getSystemTheme()).toBe('light');
    expect(resolveInitialTheme()).toBe('light');
  });
  it('follows a dark system preference', () => {
    stubSystem(true);
    expect(resolveInitialTheme()).toBe('dark');
  });
  it('follows a light system preference', () => {
    stubSystem(false);
    expect(resolveInitialTheme()).toBe('light');
  });
  it('stored choice beats the system preference', () => {
    stubSystem(true);
    localStorage.setItem(THEME_KEY, 'light');
    expect(resolveInitialTheme()).toBe('light');
    stubSystem(false);
    localStorage.setItem(THEME_KEY, 'dark');
    expect(resolveInitialTheme()).toBe('dark');
  });
  it('ignores an invalid stored value', () => {
    localStorage.setItem(THEME_KEY, 'purple');
    expect(resolveInitialTheme()).toBe('light');
  });
  it('applyTheme sets the data-theme attribute', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

function parseBlock(css, selectorPattern) {
  const match = css.match(new RegExp(`^${selectorPattern}\\s*\\{([^}]*)\\}`, 'm'));
  if (!match) throw new Error(`block not found: ${selectorPattern}`);
  const tokens = {};
  for (const m of match[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[m[1]] = m[2];
  }
  return tokens;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('WCAG contrast of theme tokens', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
  const light = parseBlock(css, ':root');
  const dark = { ...light, ...parseBlock(css, ":root\\[data-theme='dark'\\]") };

  const buttons = ['--btn-increment', '--btn-decrement', '--btn-reset', '--btn-add-four', '--btn-double'];
  const pairs = [
    ...buttons.map((bg) => ['--btn-fg', bg]),
    ...['--value-high', '--value-low', '--value-normal', '--fg'].map((fg) => [fg, '--bg']),
    ['--toggle-fg', '--toggle-bg'],
  ];

  for (const [name, tokens] of [['light', light], ['dark', dark]]) {
    for (const [fg, bg] of pairs) {
      it(`contrast ${fg} on ${bg} is at least 4.5:1 in ${name} theme`, () => {
        expect(tokens[fg]).toBeDefined();
        expect(tokens[bg]).toBeDefined();
        expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

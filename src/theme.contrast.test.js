import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, 'style.css'), 'utf8');

const tokens = (selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]),
  );
};

const light = tokens(':root');
const themes = {
  light,
  dark: { ...light, ...tokens(':root[data-theme="dark"]') },
};

const channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const BUTTON_BGS = [
  '--btn-increment-bg',
  '--btn-decrement-bg',
  '--btn-reset-bg',
  '--btn-add-four-bg',
  '--btn-double-bg',
];
const VALUE_TONES = ['--value-neutral', '--value-high', '--value-low'];

describe('theme tokens', () => {
  it('defines every token in both theme blocks', () => {
    const required = [
      '--bg', '--fg', '--btn-text', '--toggle-bg', '--toggle-fg', ...VALUE_TONES, ...BUTTON_BGS,
    ];
    const dark = tokens(':root[data-theme="dark"]');
    for (const name of required) {
      expect(light, name).toHaveProperty(name);
      expect(dark, name).toHaveProperty(name);
    }
  });
});

describe.each(Object.keys(themes))('%s theme contrast (WCAG AA 4.5:1)', (name) => {
  const t = themes[name];

  it.each(VALUE_TONES)('%s on background', (tone) => {
    expect(contrast(t[tone], t['--bg'])).toBeGreaterThanOrEqual(4.5);
  });

  it('body text on background', () => {
    expect(contrast(t['--fg'], t['--bg'])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(BUTTON_BGS)('button text on %s', (bg) => {
    expect(contrast(t['--btn-text'], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('toggle text on toggle background', () => {
    expect(contrast(t['--toggle-fg'], t['--toggle-bg'])).toBeGreaterThanOrEqual(4.5);
  });
});

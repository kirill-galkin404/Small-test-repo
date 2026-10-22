import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

const root = resolve(__dirname, '../..');
const html = readFileSync(resolve(root, 'counter.html'), 'utf8');
const script = readFileSync(resolve(root, 'counter.js'), 'utf8');
const css = readFileSync(resolve(root, 'style.css'), 'utf8');

const body = html
  .match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[\s\S]*?<\/script>/gi, '');

let warn;

beforeEach(() => {
  document.title = '';
  document.body.innerHTML = body;
  vi.spyOn(console, 'log').mockImplementation(() => {});
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  // Re-evaluate the legacy script so its globals c and cc start fresh.
  new Function(script)();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const value = () => document.getElementById('d').textContent;
const title = () => document.getElementById('ttl').textContent;
const color = () => document.getElementById('d').style.color;
const button = (action) => document.querySelector(`[data-action="${action}"]`);
const click = (action) => button(action).click();

describe('legacy counter actions', () => {
  it('increments by 1', () => {
    click('INCREMENT');
    expect(value()).toBe('1');
  });

  it('decrements by 1 with no lower bound', () => {
    click('DECREMENT');
    expect(value()).toBe('-1');
    click('DECREMENT');
    expect(value()).toBe('-2');
  });

  it('adds 4', () => {
    click('ADD_FOUR');
    expect(value()).toBe('4');
  });

  it('doubles', () => {
    click('INCREMENT');
    click('DOUBLE');
    expect(value()).toBe('2');
  });

  it('doubling zero stays zero', () => {
    click('DOUBLE');
    expect(value()).toBe('0');
  });

  it('resets to 0', () => {
    click('ADD_FOUR');
    click('RESET');
    expect(value()).toBe('0');
  });

  it('has no upper bound', () => {
    for (let i = 0; i < 10; i++) click('DOUBLE');
    click('ADD_FOUR');
    for (let i = 0; i < 10; i++) click('DOUBLE');
    expect(value()).toBe(String(4 * 1024));
  });

  it('runs the sequence from value 3: 4, 8, 16, 15, 0', () => {
    click('INCREMENT');
    click('INCREMENT');
    click('INCREMENT');
    expect(value()).toBe('3');
    const seen = [];
    for (const action of ['INCREMENT', 'ADD_FOUR', 'DOUBLE', 'DECREMENT', 'RESET']) {
      click(action);
      seen.push(value());
    }
    expect(seen).toEqual(['4', '8', '16', '15', '0']);
  });
});

describe('legacy click tally and title', () => {
  it('counts every recognized action including reset', () => {
    ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'].forEach(click);
    expect(title()).toBe('Counter (5 clicks)');
  });

  it('uses the title format "Counter (N clicks)"', () => {
    click('INCREMENT');
    expect(title()).toBe('Counter (1 clicks)');
    click('INCREMENT');
    expect(title()).toBe('Counter (2 clicks)');
  });

  it('counts reset on its own', () => {
    click('RESET');
    expect(title()).toBe('Counter (1 clicks)');
    expect(value()).toBe('0');
  });
});

describe('legacy tones', () => {
  it('is black at 0', () => {
    click('RESET');
    expect(color()).toBe('black');
  });

  it('is black at exactly 10', () => {
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('INCREMENT');
    click('INCREMENT');
    expect(value()).toBe('10');
    expect(color()).toBe('black');
  });

  it('is red above 10', () => {
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('ADD_FOUR');
    expect(value()).toBe('12');
    expect(color()).toBe('red');
  });

  it('is blue below 0', () => {
    click('DECREMENT');
    expect(color()).toBe('blue');
  });

  it('returns to black after reset from red or blue', () => {
    click('DECREMENT');
    click('RESET');
    expect(color()).toBe('black');
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('ADD_FOUR');
    click('RESET');
    expect(color()).toBe('black');
  });
});

describe('legacy unrecognized input', () => {
  const snapshot = () => document.body.innerHTML;

  it('ignores an unknown data-action and warns', () => {
    click('INCREMENT');
    const stray = document.createElement('button');
    stray.dataset.action = 'BOGUS';
    document.getElementById('counter').appendChild(stray);
    const withStray = snapshot();
    stray.click();
    expect(snapshot()).toBe(withStray);
    expect(value()).toBe('1');
    expect(title()).toBe('Counter (1 clicks)');
    expect(warn).toHaveBeenCalledWith('dispatch: unrecognized action', undefined);
    click('INCREMENT');
    expect(value()).toBe('2');
    expect(title()).toBe('Counter (2 clicks)');
  });

  it('ignores clicks on elements without data-action', () => {
    click('INCREMENT');
    const before = snapshot();
    document.getElementById('ttl').click();
    document.getElementById('d').click();
    document.getElementById('counter').click();
    expect(snapshot()).toBe(before);
    expect(value()).toBe('1');
    expect(title()).toBe('Counter (1 clicks)');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('legacy quirks', () => {
  it('quirk: nothing is rendered initially, only the static markup', () => {
    expect(title()).toBe('Counter');
    expect(value()).toBe('0');
    expect(color()).toBe('');
  });

  it('quirk: no render happens until the first recognized action', () => {
    document.getElementById('ttl').click();
    document.getElementById('counter').click();
    expect(title()).toBe('Counter');
    expect(color()).toBe('');
    click('RESET');
    expect(title()).toBe('Counter (1 clicks)');
    expect(color()).toBe('black');
  });

  it('quirk: style.css has no rules for ADD_FOUR or DOUBLE', () => {
    expect(css).not.toMatch(/ADD_FOUR/);
    expect(css).not.toMatch(/DOUBLE/);
    expect(css).toMatch(/INCREMENT/);
    expect(css).toMatch(/DECREMENT/);
    expect(css).toMatch(/RESET/);
  });
});

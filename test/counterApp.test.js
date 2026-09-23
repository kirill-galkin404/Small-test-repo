/**
 * @jest-environment jsdom
 *
 * End-to-end integration tests for CounterApp (see RULES.md / src/CounterApp.js).
 *
 * CounterApp.js is a plain classic-script file with no export: it expects
 * `React`, `ReactDOM`, and `counterReducer` to already exist as globals
 * (as they would after counter.html's CDN <script> tags run), and it
 * self-mounts into `#root` via `ReactDOM.createRoot(...).render(...)` the
 * moment it is loaded/required.
 *
 * Since this sandbox cannot reach the unpkg.com CDN, we substitute the
 * real `react` / `react-dom` npm packages (installed as devDependencies)
 * for the UMD globals counter.html would otherwise load from CDN. This
 * exercises the exact same CounterApp.js source, with real React
 * reconciliation/hooks/effects, just sourced from npm instead of a
 * `<script src="https://unpkg.com/...">` tag.
 */

global.IS_REACT_ACT_ENVIRONMENT = true;

const { act } = require('react-dom/test-utils');

function click(button) {
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function getButton(dataAction) {
  return document.querySelector('button[data-action="' + dataAction + '"]');
}

function titleText() {
  return document.getElementById('ttl').textContent;
}

function valueEl() {
  return document.getElementById('d');
}

beforeAll(() => {
  document.body.innerHTML = '<div id="root"></div>';

  global.React = require('react');
  global.ReactDOM = require('react-dom/client');
  global.counterReducer = require('../src/counterReducer.js');

  act(() => {
    require('../src/CounterApp.js');
  });
});

afterAll(() => {
  delete global.React;
  delete global.ReactDOM;
  delete global.counterReducer;
  document.documentElement.removeAttribute('data-theme');
});

describe('CounterApp end-to-end (jsdom + real React)', () => {
  test('initial render: c=0, cc=0 clicks, value--normal class', () => {
    expect(titleText()).toBe('Counter (0 clicks)');
    expect(valueEl().textContent).toBe('0');
    expect(valueEl().className).toBe('value--normal');
  });

  test('INCREMENT (+): c = c + 1, cc increments, title updates (R-0001, R-0008)', () => {
    click(getButton('INCREMENT'));
    expect(valueEl().textContent).toBe('1');
    expect(titleText()).toBe('Counter (1 clicks)');
    expect(valueEl().className).toBe('value--normal');
  });

  test('DOUBLE (x2): c = c * 2 (R-0005)', () => {
    // c is currently 1 -> DOUBLE -> 2
    click(getButton('DOUBLE'));
    expect(valueEl().textContent).toBe('2');
    expect(titleText()).toBe('Counter (2 clicks)');
  });

  test('ADD_FOUR (+4): c = c + 4 (R-0004)', () => {
    // c is currently 2 -> ADD_FOUR -> 6
    click(getButton('ADD_FOUR'));
    expect(valueEl().textContent).toBe('6');
    expect(titleText()).toBe('Counter (3 clicks)');
    expect(valueEl().className).toBe('value--normal');
  });

  test('boundary c=10 is value--normal, not value--high (R-0006)', () => {
    // c is currently 6 -> +1 four times -> 10
    click(getButton('INCREMENT'));
    click(getButton('INCREMENT'));
    click(getButton('INCREMENT'));
    click(getButton('INCREMENT'));
    expect(valueEl().textContent).toBe('10');
    expect(titleText()).toBe('Counter (7 clicks)');
    expect(valueEl().className).toBe('value--normal');
  });

  test('c=11 is value--high (R-0006)', () => {
    // c is currently 10 -> INCREMENT -> 11
    click(getButton('INCREMENT'));
    expect(valueEl().textContent).toBe('11');
    expect(titleText()).toBe('Counter (8 clicks)');
    expect(valueEl().className).toBe('value--high');
  });

  test('RESET (reset): c becomes 0 unconditionally, cc still increments (R-0003, R-0008)', () => {
    // c is currently 11 -> RESET -> 0, cc keeps counting
    click(getButton('RESET'));
    expect(valueEl().textContent).toBe('0');
    expect(titleText()).toBe('Counter (9 clicks)');
    expect(valueEl().className).toBe('value--normal');
  });

  test('DECREMENT (-) from 0: c = -1, value--negative (R-0002, R-0006)', () => {
    // c is currently 0 -> DECREMENT -> -1
    click(getButton('DECREMENT'));
    expect(valueEl().textContent).toBe('-1');
    expect(titleText()).toBe('Counter (10 clicks)');
    expect(valueEl().className).toBe('value--negative');
  });

  test('theme toggle: clicking sets data-theme="dark" on <html>, clicking again removes it', () => {
    const toggle = document.getElementById('theme-toggle');
    expect(toggle).not.toBeNull();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);

    click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(toggle.textContent).toBe('☀️ Light theme');

    click(toggle);
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(toggle.textContent).toBe('🌙 Dark theme');
  });

  test('theme toggle does not affect counter state (c, cc unchanged by TOGGLE_THEME)', () => {
    // c is currently -1, cc is currently 10 clicks (from the DECREMENT test above)
    const before = { value: valueEl().textContent, title: titleText() };
    const toggle = document.getElementById('theme-toggle');
    click(toggle);
    click(toggle);
    expect(valueEl().textContent).toBe(before.value);
    expect(titleText()).toBe(before.title);
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, click, mount } from './helpers/mount.js';

const d = () => document.querySelector('#d');
const ttl = () => document.querySelector('#ttl');
const btn = (action) => document.querySelector(`button[data-action="${action}"]`);
const press = (...actions) => actions.forEach((a) => click(btn(a)));
const state = () => ({
  value: d().textContent,
  title: ttl().textContent,
  color: d().style.color,
});

beforeEach(() => {
  mount();
});
afterEach(() => {
  cleanup();
});

describe('initial state', () => {
  it('shows Counter and 0 before any click', () => {
    expect(ttl().textContent).toBe('Counter');
    expect(d().textContent).toBe('0');
    expect(['', 'black']).toContain(d().style.color);
  });

  it('renders the five action buttons with their labels', () => {
    const labels = {
      INCREMENT: '+',
      DECREMENT: '-',
      RESET: 'reset',
      ADD_FOUR: '+4',
      DOUBLE: 'x2',
    };
    for (const [action, label] of Object.entries(labels)) {
      expect(btn(action).textContent).toBe(label);
    }
    expect(document.querySelectorAll('button[data-action]')).toHaveLength(5);
  });
});

describe('actions', () => {
  it('INCREMENT adds 1', () => {
    press('INCREMENT');
    expect(d().textContent).toBe('1');
    press('INCREMENT');
    expect(d().textContent).toBe('2');
  });

  it('DECREMENT subtracts 1 with no lower bound', () => {
    press('DECREMENT');
    expect(d().textContent).toBe('-1');
    press('DECREMENT', 'DECREMENT');
    expect(d().textContent).toBe('-3');
  });

  it('RESET sets the value to 0', () => {
    press('INCREMENT', 'INCREMENT', 'INCREMENT', 'RESET');
    expect(d().textContent).toBe('0');
    press('DECREMENT', 'RESET');
    expect(d().textContent).toBe('0');
  });

  it('ADD_FOUR adds 4', () => {
    press('ADD_FOUR');
    expect(d().textContent).toBe('4');
    press('ADD_FOUR');
    expect(d().textContent).toBe('8');
  });

  it('DOUBLE doubles the value', () => {
    press('INCREMENT', 'DOUBLE');
    expect(d().textContent).toBe('2');
    press('DOUBLE');
    expect(d().textContent).toBe('4');
  });

  it('DOUBLE of 0 stays 0', () => {
    press('DOUBLE');
    expect(d().textContent).toBe('0');
  });

  it('DOUBLE of a negative value doubles it', () => {
    press('DECREMENT', 'DECREMENT', 'DOUBLE');
    expect(d().textContent).toBe('-4');
    press('DOUBLE');
    expect(d().textContent).toBe('-8');
  });

  it('mixed sequences: ADD_FOUR then DOUBLE then INCREMENT', () => {
    press('ADD_FOUR', 'DOUBLE', 'INCREMENT');
    expect(d().textContent).toBe('9');
  });

  it('mixed sequences: INCREMENT then DOUBLE then ADD_FOUR differs by order', () => {
    press('INCREMENT', 'DOUBLE', 'ADD_FOUR');
    expect(d().textContent).toBe('6');
  });

  it('mixed sequence crossing zero and back', () => {
    press('DECREMENT', 'ADD_FOUR', 'DOUBLE', 'DECREMENT', 'RESET', 'INCREMENT');
    expect(d().textContent).toBe('1');
  });

  it('has no upper bound', () => {
    press('INCREMENT');
    for (let i = 0; i < 70; i++) press('DOUBLE');
    expect(d().textContent).toBe(String(2 ** 70));
    press('ADD_FOUR');
    expect(d().textContent).toBe(String(2 ** 70 + 4));
  });

  it('has no lower bound', () => {
    press('DECREMENT');
    for (let i = 0; i < 40; i++) press('DOUBLE');
    expect(d().textContent).toBe(String(-(2 ** 40)));
  });
});

describe('title tally', () => {
  it('uses singular wording after one click', () => {
    press('INCREMENT');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
  });

  it('increments by one after every recognised action', () => {
    press('INCREMENT');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
    press('DECREMENT');
    expect(ttl().textContent).toBe('Counter (2 clicks)');
    press('ADD_FOUR');
    expect(ttl().textContent).toBe('Counter (3 clicks)');
    press('DOUBLE');
    expect(ttl().textContent).toBe('Counter (4 clicks)');
    press('RESET');
    expect(ttl().textContent).toBe('Counter (5 clicks)');
  });

  it('RESET still increments the tally', () => {
    press('RESET');
    expect(d().textContent).toBe('0');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
    press('INCREMENT', 'INCREMENT', 'RESET');
    expect(ttl().textContent).toBe('Counter (4 clicks)');
  });

  it('never resets the tally', () => {
    press('INCREMENT', 'RESET', 'INCREMENT', 'RESET', 'RESET');
    expect(ttl().textContent).toBe('Counter (5 clicks)');
    press('DOUBLE');
    expect(ttl().textContent).toBe('Counter (6 clicks)');
  });

  it('counts a DOUBLE of 0 as a recognised action', () => {
    press('DOUBLE', 'DOUBLE');
    expect(d().textContent).toBe('0');
    expect(ttl().textContent).toBe('Counter (2 clicks)');
  });
});

describe('colour', () => {
  it('is black at 0 after an action', () => {
    press('INCREMENT', 'DECREMENT');
    expect(d().textContent).toBe('0');
    expect(d().style.color).toBe('black');
  });

  it('is black at 10', () => {
    press('ADD_FOUR', 'ADD_FOUR', 'INCREMENT', 'INCREMENT');
    expect(d().textContent).toBe('10');
    expect(d().style.color).toBe('black');
  });

  it('is red at 11', () => {
    press('ADD_FOUR', 'ADD_FOUR', 'INCREMENT', 'INCREMENT', 'INCREMENT');
    expect(d().textContent).toBe('11');
    expect(d().style.color).toBe('red');
  });

  it('is blue at -1', () => {
    press('DECREMENT');
    expect(d().textContent).toBe('-1');
    expect(d().style.color).toBe('blue');
  });

  it('is black at 1', () => {
    press('INCREMENT');
    expect(d().style.color).toBe('black');
  });

  it('returns to black after RESET from red or blue', () => {
    press('ADD_FOUR', 'DOUBLE', 'DOUBLE');
    expect(d().style.color).toBe('red');
    press('RESET');
    expect(d().style.color).toBe('black');
    press('DECREMENT');
    expect(d().style.color).toBe('blue');
    press('RESET');
    expect(d().style.color).toBe('black');
  });

  it('stays blue while doubling negatives and red while doubling positives', () => {
    press('DECREMENT', 'DOUBLE', 'DOUBLE');
    expect(d().style.color).toBe('blue');
    press('RESET', 'INCREMENT', 'ADD_FOUR', 'DOUBLE');
    expect(d().textContent).toBe('10');
    expect(d().style.color).toBe('black');
    press('DOUBLE');
    expect(d().style.color).toBe('red');
  });
});

describe('no-op clicks', () => {
  const addButton = (action) => {
    const extra = document.createElement('button');
    extra.dataset.action = action;
    extra.textContent = action;
    document.querySelector('#counter').appendChild(extra);
    return extra;
  };

  const expectNoOp = (target) => {
    const before = state();
    click(target);
    expect(state()).toEqual(before);
  };

  it('clicking #d changes nothing at the initial state', () => {
    expectNoOp(d());
    expect(ttl().textContent).toBe('Counter');
  });

  it('clicking #d changes nothing after actions', () => {
    press('ADD_FOUR', 'DOUBLE');
    expectNoOp(d());
    expect(ttl().textContent).toBe('Counter (2 clicks)');
  });

  it('clicking #ttl changes nothing', () => {
    press('DECREMENT');
    expectNoOp(ttl());
  });

  it('a button with data-action="bogus" changes nothing and is not counted', () => {
    const bogus = addButton('bogus');
    expectNoOp(bogus);
    press('INCREMENT');
    expectNoOp(bogus);
    expect(d().textContent).toBe('1');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
  });

  it('a button with data-action="toString" changes nothing and is not counted', () => {
    const inherited = addButton('toString');
    expectNoOp(inherited);
    press('ADD_FOUR');
    expectNoOp(inherited);
    expect(d().textContent).toBe('4');
    expect(ttl().textContent).toBe('Counter (1 clicks)');
  });

  it('no-op clicks in red and blue states keep the colour', () => {
    const bogus = addButton('bogus');
    press('ADD_FOUR', 'DOUBLE', 'DOUBLE');
    expectNoOp(bogus);
    expect(d().style.color).toBe('red');
    press('RESET', 'DECREMENT');
    expectNoOp(bogus);
    expect(d().style.color).toBe('blue');
  });

  it('a no-op between actions does not disturb the tally', () => {
    const bogus = addButton('bogus');
    press('INCREMENT');
    click(bogus);
    press('INCREMENT');
    expect(d().textContent).toBe('2');
    expect(ttl().textContent).toBe('Counter (2 clicks)');
  });
});

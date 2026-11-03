import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter.jsx';

const btn = (action) => document.querySelector(`button[data-action="${action}"]`);
const click = (action, times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(btn(action));
};
const display = () => document.getElementById('d');
const title = () => document.getElementById('ttl');

describe('Counter', () => {
  beforeEach(() => {
    render(<Counter />);
  });

  it('starts at 0 with heading "Counter" and five data-action buttons', () => {
    expect(display()).toHaveTextContent('0');
    expect(title()).toHaveTextContent(/^Counter$/);
    ['INCREMENT', 'DECREMENT', 'RESET', 'ADD_FOUR', 'DOUBLE'].forEach((a) => {
      expect(btn(a)).toBeInTheDocument();
    });
    expect(document.querySelectorAll('button[data-action]')).toHaveLength(5);
    ['+', '-', 'reset', '+4', 'x2'].forEach((label) => {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    });
  });

  it('INCREMENT adds 1', () => {
    click('INCREMENT');
    expect(display()).toHaveTextContent('1');
  });

  it('DECREMENT subtracts 1 and allows negatives', () => {
    click('DECREMENT');
    expect(display()).toHaveTextContent('-1');
    click('DECREMENT');
    expect(display()).toHaveTextContent('-2');
  });

  it('RESET sets the value to 0', () => {
    click('ADD_FOUR');
    click('RESET');
    expect(display()).toHaveTextContent(/^0$/);
  });

  it('ADD_FOUR adds 4', () => {
    click('ADD_FOUR');
    expect(display()).toHaveTextContent('4');
  });

  it('DOUBLE multiplies by 2', () => {
    click('ADD_FOUR');
    click('DOUBLE');
    expect(display()).toHaveTextContent('8');
    click('RESET');
    click('DECREMENT');
    click('DOUBLE');
    expect(display()).toHaveTextContent('-2');
  });

  it('works via visible button labels too', () => {
    fireEvent.click(screen.getByRole('button', { name: '+4' }));
    fireEvent.click(screen.getByRole('button', { name: 'x2' }));
    expect(display()).toHaveTextContent('8');
  });

  describe('colour thresholds', () => {
    it('is black at 0', () => {
      expect(display().style.color).toBe('black');
    });

    it('is black at 10 and red at 11', () => {
      click('ADD_FOUR', 2);
      click('INCREMENT', 2);
      expect(display()).toHaveTextContent(/^10$/);
      expect(display().style.color).toBe('black');
      click('INCREMENT');
      expect(display()).toHaveTextContent(/^11$/);
      expect(display().style.color).toBe('red');
    });

    it('is blue at -1 and black again at 0', () => {
      click('DECREMENT');
      expect(display()).toHaveTextContent('-1');
      expect(display().style.color).toBe('blue');
      click('INCREMENT');
      expect(display()).toHaveTextContent(/^0$/);
      expect(display().style.color).toBe('black');
    });
  });

  describe('click-count heading', () => {
    it('shows "Counter (N clicks)" after clicks', () => {
      click('INCREMENT');
      expect(title()).toHaveTextContent('Counter (1 clicks)');
      click('DOUBLE');
      click('ADD_FOUR');
      expect(title()).toHaveTextContent('Counter (3 clicks)');
    });

    it('counts RESET and does not clear the count', () => {
      click('INCREMENT', 2);
      click('RESET');
      expect(display()).toHaveTextContent(/^0$/);
      expect(title()).toHaveTextContent('Counter (3 clicks)');
      click('DECREMENT');
      expect(title()).toHaveTextContent('Counter (4 clicks)');
    });
  });
});

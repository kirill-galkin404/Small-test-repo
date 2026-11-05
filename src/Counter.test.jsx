import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter.jsx';

const click = (label) => fireEvent.click(screen.getByRole('button', { name: label }));
const value = () => document.getElementById('d');
const heading = () => screen.getByRole('heading');

describe('Counter', () => {
  it('starts with heading "Counter" and value 0', () => {
    render(<Counter />);
    expect(heading()).toHaveTextContent(/^Counter$/);
    expect(value()).toHaveTextContent(/^0$/);
    expect(value().style.color).toBe('black');
  });

  it('renders the five buttons in order', () => {
    render(<Counter />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['+', '-', 'reset', '+4', 'x2']);
  });

  it('handles all five actions, counting clicks (including reset) and colouring the value', () => {
    render(<Counter />);
    click('+');
    expect(value()).toHaveTextContent(/^1$/);
    expect(heading()).toHaveTextContent('Counter (1 clicks)');
    click('-');
    click('-');
    expect(value()).toHaveTextContent(/^-1$/);
    expect(value().style.color).toBe('blue');
    expect(heading()).toHaveTextContent('Counter (3 clicks)');
    click('+4');
    expect(value()).toHaveTextContent(/^3$/);
    expect(value().style.color).toBe('black');
    click('x2');
    expect(value()).toHaveTextContent(/^6$/);
    click('x2');
    expect(value()).toHaveTextContent(/^12$/);
    expect(value().style.color).toBe('red');
    expect(heading()).toHaveTextContent('Counter (6 clicks)');
    click('reset');
    expect(value()).toHaveTextContent(/^0$/);
    expect(value().style.color).toBe('black');
    expect(heading()).toHaveTextContent('Counter (7 clicks)');
  });

  it('colours 10 black and 11 red', () => {
    render(<Counter />);
    click('+4'); click('+4'); click('+'); click('+');
    expect(value()).toHaveTextContent(/^10$/);
    expect(value().style.color).toBe('black');
    click('+');
    expect(value()).toHaveTextContent(/^11$/);
    expect(value().style.color).toBe('red');
  });

  it('uses id="d" on the value element and classes on buttons', () => {
    render(<Counter />);
    expect(value().id).toBe('d');
    expect(screen.getByRole('button', { name: '+4' })).toHaveClass('btn-add-four');
  });
});

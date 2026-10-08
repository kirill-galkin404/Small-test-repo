import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter.jsx';

const click = (label) => fireEvent.click(screen.getByRole('button', { name: label }));
const value = () => screen.getByTestId('value');

describe('Counter', () => {
  it('renders the initial state', () => {
    render(<Counter />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^Counter$/);
    expect(value()).toHaveTextContent('0');
    expect(value()).toHaveClass('value--neutral');
  });

  it.each([
    ['+', '1'],
    ['-', '-1'],
    ['reset', '0'],
    ['+4', '4'],
    ['x2', '0'],
  ])('button %s from 0 shows %s', (label, shown) => {
    render(<Counter />);
    click(label);
    expect(value()).toHaveTextContent(new RegExp(`^${shown}$`));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (1 clicks)');
  });

  it('combines actions', () => {
    render(<Counter />);
    click('+4');
    click('x2');
    expect(value()).toHaveTextContent(/^8$/);
    click('-');
    expect(value()).toHaveTextContent(/^7$/);
    click('reset');
    expect(value()).toHaveTextContent(/^0$/);
  });

  it('keeps the click count rising across reset', () => {
    render(<Counter />);
    click('+');
    click('reset');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (2 clicks)');
    click('reset');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (3 clicks)');
  });

  it('turns high above 10', () => {
    render(<Counter />);
    click('+4');
    click('+4');
    click('+');
    click('+');
    expect(value()).toHaveTextContent(/^10$/);
    expect(value()).toHaveClass('value--neutral');
    click('+');
    expect(value()).toHaveTextContent(/^11$/);
    expect(value()).toHaveClass('value--high');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Counter (5 clicks)');
  });

  it('turns low below 0', () => {
    render(<Counter />);
    click('-');
    expect(value()).toHaveTextContent(/^-1$/);
    expect(value()).toHaveClass('value--low');
    click('reset');
    expect(value()).toHaveClass('value--neutral');
  });
});

import React from 'react';
import { act, cleanup as rtlCleanup, fireEvent, render } from '@testing-library/react';
import Counter from '../../src/Counter.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mounts a fresh React <Counter /> into document.body.
export function mount() {
  cleanup();
  render(React.createElement(Counter));
  return document.body;
}

// Clicks an element the way a user would, flushing React state updates.
export function click(element) {
  act(() => {
    fireEvent.click(element);
  });
}

export function cleanup() {
  rtlCleanup();
  document.body.innerHTML = '';
}

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const html = readFileSync(resolve(root, 'counter.html'), 'utf8');
const script = readFileSync(resolve(root, 'counter.js'), 'utf8');

const bodyMarkup = html
  .match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]
  .replace(/<script[\s\S]*?<\/script>/gi, '');

let logSpies = [];

// Mounts a fresh legacy counter (counter.html + counter.js, unmodified) into document.body.
export function mount() {
  cleanup();
  logSpies = ['log', 'warn'].map((m) => vi.spyOn(console, m).mockImplementation(() => {}));
  document.body.innerHTML = bodyMarkup;
  // Own function scope per mount so counter.js's top-level state is isolated.
  new Function(script)();
  return document.body;
}

// Clicks an element the way a user would.
export function click(element) {
  element.click();
}

export function cleanup() {
  document.body.innerHTML = '';
  logSpies.forEach((s) => s.mockRestore());
  logSpies = [];
}

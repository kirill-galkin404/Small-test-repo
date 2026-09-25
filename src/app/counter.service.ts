import { Injectable, signal } from '@angular/core';

/**
 * Mirrors the legacy `ACTION` map from counter.js (data-action string ->
 * action). Exported so consumers (e.g. CounterComponent) can bind buttons
 * to these values, matching counter.html's `data-action` attributes.
 */
export enum CounterAction {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
  RESET = 'RESET',
  ADD_FOUR = 'ADD_FOUR',
  DOUBLE = 'DOUBLE',
}

@Injectable({ providedIn: 'root' })
export class CounterService {
  readonly #count = signal(0);
  readonly #clickCount = signal(0);

  readonly count = this.#count.asReadonly();
  readonly clickCount = this.#clickCount.asReadonly();

  dispatch(action: CounterAction | string | undefined): void {
    switch (action) {
      case CounterAction.INCREMENT:
        this.#count.update((c) => c + 1);
        break;
      case CounterAction.DECREMENT:
        this.#count.update((c) => c - 1);
        break;
      case CounterAction.RESET:
        this.#count.set(0);
        break;
      case CounterAction.ADD_FOUR:
        this.#count.update((c) => c + 4);
        break;
      case CounterAction.DOUBLE:
        this.#count.update((c) => c * 2);
        break;
      default:
        console.warn('dispatch: unrecognized action', action);
        return;
    }

    this.#clickCount.update((cc) => cc + 1);
  }
}

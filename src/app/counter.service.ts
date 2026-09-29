import { Injectable, signal } from '@angular/core';

export type CounterAction = 'INCREMENT' | 'DECREMENT' | 'RESET' | 'ADD_FOUR' | 'DOUBLE';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private readonly countSignal = signal(0);
  private readonly clickCountSignal = signal(0);

  readonly count = this.countSignal.asReadonly();
  readonly clickCount = this.clickCountSignal.asReadonly();

  dispatch(action: CounterAction | undefined): void {
    switch (action) {
      case 'INCREMENT':
        this.countSignal.update((c) => c + 1);
        break;
      case 'DECREMENT':
        this.countSignal.update((c) => c - 1);
        break;
      case 'RESET':
        this.countSignal.set(0);
        break;
      case 'ADD_FOUR':
        this.countSignal.update((c) => c + 4);
        break;
      case 'DOUBLE':
        this.countSignal.update((c) => c * 2);
        break;
      default:
        return;
    }

    this.clickCountSignal.update((cc) => cc + 1);
  }
}

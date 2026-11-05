import { Component, computed, signal } from '@angular/core';
import {
  CounterState,
  colorFor,
  dispatch,
  initialState,
  parseAction,
  titleFor,
} from './counter.logic';

@Component({
  selector: 'app-counter',
  standalone: true,
  templateUrl: './counter.component.html',
})
export class CounterComponent {
  readonly state = signal<CounterState>(initialState);
  readonly color = computed(() => colorFor(this.state().value));
  readonly title = computed(() => titleFor(this.state().clicks));

  onClick(event: Event): void {
    const action = (event.target as HTMLElement).dataset['action'];
    if (!action) {
      return;
    }
    this.state.set(dispatch(this.state(), parseAction(action)));
  }
}

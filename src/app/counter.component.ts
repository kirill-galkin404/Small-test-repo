import { Component, computed, inject } from '@angular/core';
import { CounterService } from './counter.service';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.css',
})
export class CounterComponent {
  protected readonly counterService = inject(CounterService);

  protected readonly count = this.counterService.count;
  protected readonly clickCount = this.counterService.clickCount;

  protected readonly valueColor = computed(() => {
    const value = this.count();
    if (value > 10) {
      return 'red';
    }
    if (value < 0) {
      return 'blue';
    }
    return 'black';
  });
}

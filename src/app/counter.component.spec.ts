import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CounterComponent } from './counter.component';
import { CounterService } from './counter.service';

describe('CounterComponent', () => {
  let service: CounterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent],
    }).compileComponents();

    service = TestBed.inject(CounterService);
  });

  function createFixture() {
    const fixture = TestBed.createComponent(CounterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should be created', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('displays the value in black when count() is between 0 and 10 inclusive', () => {
    const fixture = createFixture();
    service.dispatch('INCREMENT');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('#d');
    expect(value.textContent.trim()).toBe('1');
    expect(value.style.color).toBe('black');
  });

  it('displays the value in red when count() is greater than 10', () => {
    const fixture = createFixture();
    for (let i = 0; i < 11; i++) {
      service.dispatch('INCREMENT');
    }
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('#d');
    expect(value.textContent.trim()).toBe('11');
    expect(value.style.color).toBe('red');
  });

  it('displays the value in blue when count() is less than 0', () => {
    const fixture = createFixture();
    service.dispatch('DECREMENT');
    fixture.detectChanges();

    const value = fixture.nativeElement.querySelector('#d');
    expect(value.textContent.trim()).toBe('-1');
    expect(value.style.color).toBe('blue');
  });

  it('displays the heading text as "Counter (N clicks)" matching clickCount()', () => {
    const fixture = createFixture();
    service.dispatch('INCREMENT');
    service.dispatch('DECREMENT');
    service.dispatch('ADD_FOUR');
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('#ttl');
    expect(heading.textContent.trim()).toBe('Counter (3 clicks)');
  });

  it('clicking the increment button dispatches INCREMENT', () => {
    const fixture = createFixture();
    spyOn(service, 'dispatch');

    const button = fixture.debugElement.query(By.css('.counter__btn--increment'));
    button.nativeElement.click();

    expect(service.dispatch).toHaveBeenCalledWith('INCREMENT');
  });

  it('clicking the decrement button dispatches DECREMENT', () => {
    const fixture = createFixture();
    spyOn(service, 'dispatch');

    const button = fixture.debugElement.query(By.css('.counter__btn--decrement'));
    button.nativeElement.click();

    expect(service.dispatch).toHaveBeenCalledWith('DECREMENT');
  });

  it('clicking the reset button dispatches RESET', () => {
    const fixture = createFixture();
    spyOn(service, 'dispatch');

    const button = fixture.debugElement.query(By.css('.counter__btn--reset'));
    button.nativeElement.click();

    expect(service.dispatch).toHaveBeenCalledWith('RESET');
  });

  it('clicking the add-four button dispatches ADD_FOUR', () => {
    const fixture = createFixture();
    spyOn(service, 'dispatch');

    const button = fixture.debugElement.query(By.css('.counter__btn--add-four'));
    button.nativeElement.click();

    expect(service.dispatch).toHaveBeenCalledWith('ADD_FOUR');
  });

  it('clicking the double button dispatches DOUBLE', () => {
    const fixture = createFixture();
    spyOn(service, 'dispatch');

    const button = fixture.debugElement.query(By.css('.counter__btn--double'));
    button.nativeElement.click();

    expect(service.dispatch).toHaveBeenCalledWith('DOUBLE');
  });
});

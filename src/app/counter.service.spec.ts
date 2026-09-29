import { TestBed } from '@angular/core/testing';
import { CounterAction, CounterService } from './counter.service';

describe('CounterService', () => {
  let service: CounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('INCREMENT increases count() by 1 (R-0003)', () => {
    service.dispatch('INCREMENT');
    expect(service.count()).toBe(1);
    service.dispatch('INCREMENT');
    expect(service.count()).toBe(2);
  });

  it('DECREMENT decreases count() by 1 (R-0004)', () => {
    service.dispatch('DECREMENT');
    expect(service.count()).toBe(-1);
    service.dispatch('DECREMENT');
    expect(service.count()).toBe(-2);
  });

  it('RESET sets count() to 0 but does NOT reset clickCount() (R-0005)', () => {
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    expect(service.count()).toBe(3);
    expect(service.clickCount()).toBe(3);

    service.dispatch('RESET');
    expect(service.count()).toBe(0);
    // clickCount is NOT reset by RESET - it still increments on the RESET dispatch.
    expect(service.clickCount()).toBe(4);
  });

  it('ADD_FOUR increases count() by 4 (R-0006)', () => {
    service.dispatch('ADD_FOUR');
    expect(service.count()).toBe(4);
    service.dispatch('ADD_FOUR');
    expect(service.count()).toBe(8);
  });

  it('DOUBLE doubles count() from a non-zero starting value (R-0007)', () => {
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    expect(service.count()).toBe(3);

    service.dispatch('DOUBLE');
    expect(service.count()).toBe(6);
  });

  it('clickCount() increments by exactly 1 per recognized dispatch (R-0009)', () => {
    expect(service.clickCount()).toBe(0);

    service.dispatch('INCREMENT');
    expect(service.clickCount()).toBe(1);

    service.dispatch('DECREMENT');
    expect(service.clickCount()).toBe(2);

    service.dispatch('ADD_FOUR');
    expect(service.clickCount()).toBe(3);

    service.dispatch('DOUBLE');
    expect(service.clickCount()).toBe(4);

    service.dispatch('RESET');
    expect(service.clickCount()).toBe(5);
  });

  it('dispatching an unrecognized action leaves count() and clickCount() unchanged (R-0008)', () => {
    service.dispatch('INCREMENT');
    service.dispatch('ADD_FOUR');
    const countBefore = service.count();
    const clickCountBefore = service.clickCount();

    service.dispatch('NOT_A_REAL_ACTION' as unknown as CounterAction);

    expect(service.count()).toBe(countBefore);
    expect(service.clickCount()).toBe(clickCountBefore);
  });

  it('dispatching undefined leaves count() and clickCount() unchanged (R-0008)', () => {
    service.dispatch('INCREMENT');
    service.dispatch('DOUBLE');
    const countBefore = service.count();
    const clickCountBefore = service.clickCount();

    service.dispatch(undefined);

    expect(service.count()).toBe(countBefore);
    expect(service.clickCount()).toBe(clickCountBefore);
  });

  it('unrecognized actions interleaved with recognized ones never increment clickCount() (R-0009)', () => {
    service.dispatch('INCREMENT'); // c=1, cc=1
    service.dispatch('BOGUS' as unknown as CounterAction); // no-op
    service.dispatch('INCREMENT'); // c=2, cc=2
    service.dispatch(undefined); // no-op
    service.dispatch('ADD_FOUR'); // c=6, cc=3

    expect(service.count()).toBe(6);
    expect(service.clickCount()).toBe(3);
  });

  it('matches the legacy contract sequence: three INCREMENTs then RESET', () => {
    // Cross-check against legacy-contract/contract.md table: R-0003 then R-0005.
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    service.dispatch('INCREMENT');
    service.dispatch('RESET');

    expect(service.count()).toBe(0);
    expect(service.clickCount()).toBe(4);
  });
});

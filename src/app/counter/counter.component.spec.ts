import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let root: HTMLElement;

  const el = (id: string) => root.querySelector(`#${id}`) as HTMLElement;
  const click = (target: HTMLElement) => {
    target.click();
    fixture.detectChanges();
  };
  const press = (action: string) =>
    click(root.querySelector(`[data-action="${action}"]`) as HTMLElement);

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [CounterComponent] });
    fixture = TestBed.createComponent(CounterComponent);
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders the initial title and value', () => {
    expect(el('ttl').textContent).toBe('Counter');
    expect(el('d').textContent).toBe('0');
    expect(el('d').style.color).toBe('black');
  });

  it('increments and updates the title', () => {
    press('INCREMENT');
    expect(el('d').textContent).toBe('1');
    expect(el('ttl').textContent).toBe('Counter (1 clicks)');
  });

  it('decrements below zero and turns blue', () => {
    press('DECREMENT');
    expect(el('d').textContent).toBe('-1');
    expect(el('d').style.color).toBe('blue');
  });

  it('adds four and doubles', () => {
    press('ADD_FOUR');
    expect(el('d').textContent).toBe('4');
    press('DOUBLE');
    expect(el('d').textContent).toBe('8');
    expect(el('d').style.color).toBe('black');
  });

  it('turns red only above 10', () => {
    press('ADD_FOUR');
    press('ADD_FOUR');
    press('INCREMENT');
    press('INCREMENT');
    expect(el('d').textContent).toBe('10');
    expect(el('d').style.color).toBe('black');
    press('INCREMENT');
    expect(el('d').textContent).toBe('11');
    expect(el('d').style.color).toBe('red');
  });

  it('reset returns to 0, black, and still counts as a click', () => {
    press('ADD_FOUR');
    press('ADD_FOUR');
    press('ADD_FOUR');
    expect(el('d').style.color).toBe('red');
    press('RESET');
    expect(el('d').textContent).toBe('0');
    expect(el('d').style.color).toBe('black');
    expect(el('ttl').textContent).toBe('Counter (4 clicks)');
  });

  it('ignores clicks on #ttl, #d and #counter itself', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    press('INCREMENT');
    click(el('ttl'));
    click(el('d'));
    click(el('counter'));
    expect(el('d').textContent).toBe('1');
    expect(el('ttl').textContent).toBe('Counter (1 clicks)');
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns on an unrecognized action and does not tally', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const bogus = document.createElement('button');
    bogus.dataset['action'] = 'BOGUS';
    el('counter').appendChild(bogus);
    click(bogus);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toBe('dispatch: unrecognized action');
    expect(el('d').textContent).toBe('0');
    expect(el('ttl').textContent).toBe('Counter');
  });
});

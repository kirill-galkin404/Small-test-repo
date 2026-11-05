import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { CounterComponent } from './counter/counter.component';

describe('routes', () => {
  it("redirects '' to 'counter' with pathMatch full", () => {
    const route = routes.find((r) => r.path === '');
    expect(route).toBeDefined();
    expect(route?.redirectTo).toBe('counter');
    expect(route?.pathMatch).toBe('full');
  });

  it("maps 'counter' to CounterComponent", () => {
    const route = routes.find((r) => r.path === 'counter');
    expect(route?.component).toBe(CounterComponent);
  });

  it("navigating to '' lands on /counter and renders the counter", async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/');
    expect(TestBed.inject(Location).path()).toBe('/counter');
    expect(component).toBeInstanceOf(CounterComponent);
  });
});


## Development notes

This is a standalone Angular application. State and behavior are split
between a service and a component, replacing the legacy single-file
`<script>` approach:

- **`CounterService`** (`src/app/counter.service.ts`) owns all state and
  behavior. It holds the counter value and the click count as two Angular
  `signal`s, exposed read-only as `count` and `clickCount`. `dispatch(action)`
  is the single entry point for mutating state: it switches on a
  `CounterAction` (`'INCREMENT' | 'DECREMENT' | 'RESET' | 'ADD_FOUR' |
  'DOUBLE'`), and every recognized case falls through to a shared tail that
  increments `clickCount` by 1. An unrecognized/`undefined` action is
  ignored — no state changes and no click-count increment.
- **`CounterComponent`** (`src/app/counter.component.ts` /
  `.html`) renders the counter and wires up user interaction. Each button
  binds directly to `counterService.dispatch('INCREMENT' | 'DECREMENT' |
  'RESET' | 'ADD_FOUR' | 'DOUBLE')` via Angular's `(click)` event binding —
  there is no delegated `addEventListener` or `data-action` attribute
  lookup. The template reads `count()` and `clickCount()` directly from the
  service's signals and computes the display color for the counter value
  (`red` above 10, `blue` below 0, `black` otherwise) via a `computed()`
  in the component.

See `RULES.md` for the project's enforceable rulebook: the ESLint/Prettier
configuration and the behavior contract (preserved from the legacy
`counter.js` widget) that `CounterService`/`CounterComponent` must not
break.

## Building and testing

This is an Angular CLI project (see `angular.json` / `package.json`).
After `npm install`:

- `npm run build` (or `ng build`) — builds the application.
- `npm test` (or `ng test`) — runs the unit tests (Karma/Jasmine), including
  `src/app/counter.service.spec.ts`, which exercises `CounterService`
  against the legacy behavior contract.
- `npm run lint` (or `ng lint`) — lints the project; see `RULES.md` for the
  configuration this enforces.
- `npm start` (or `ng serve`) — serves the application locally.

## Architectural decisions

See [docs/adr/0002-angular-rewrite-supersedes-0001.md](docs/adr/0002-angular-rewrite-supersedes-0001.md)
for the decision to rewrite the counter widget as this Angular application
(introducing a build step and a real module system). That ADR supersedes
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md),
which recorded the original single-file, no-build-step decision for the
legacy `counter.html`/`counter.js` widget; 0001 is kept only as a historical
record and no longer reflects the live architecture.

# Project Rules

These rules govern how the counter widget's source is organized and
maintained. They apply to all current and future contributions.

## 1. Module boundaries

- Pure logic and UI/rendering code are kept in separate modules:
  - `src/reducer.js` and `src/formatter.js` are **pure logic modules**.
    They must stay framework-free: no imports from `react` or
    `react-dom`, no JSX, and no dependency on any rendering library.
  - `src/Counter.jsx` and any other `.jsx` file are **UI components**.
    All JSX and rendering concerns live here.
- Business/domain logic (state transitions, formatting/display rules,
  thresholds, guards) belongs in the pure logic modules, never inline
  in a component. A component's job is to hold UI wiring — calling
  `useReducer`, rendering markup, and attaching event handlers — not
  to decide *what* the next state or displayed value should be.
- Components read state and derive presentation exclusively through
  the exported pure functions (e.g. `formatDisplay`, `formatTitle`)
  and dispatch actions exclusively through the exported action
  constants (e.g. `ACTIONS`). Components must not duplicate or
  reimplement logic that already exists in a pure logic module.
- New pure logic goes into a new or existing module under `src/`
  named for the concern it covers (e.g. a new `src/validator.js` for
  new validation logic) rather than being folded into a component or
  into an unrelated module.

## 2. Reducer purity / no direct DOM mutation

- Every reducer (e.g. `reducer` in `src/reducer.js`) must be a pure
  function:
  - Same `(state, action)` input always produces the same output.
  - It must never mutate its `state` or `action` arguments; it always
    returns a new state object (or, for an unrecognized action type,
    returns the exact same `state` reference, unchanged).
  - It must not read from or write to the DOM, `window`, `document`,
    timers, randomness, network, or any other external/mutable
    source, and must not log to the console or otherwise perform
    side effects.
- Formatting/derivation functions (e.g. `formatDisplay`,
  `formatTitle` in `src/formatter.js`) must be pure in the same
  sense: given the same state, they always return the same value,
  with no side effects and no mutation of their input.
- UI code must never mutate the DOM directly. Patterns such as
  `document.getElementById(...).textContent = ...`,
  `element.innerHTML = ...`, or any other imperative DOM write are
  disallowed. All rendering must flow through React: state changes
  are dispatched to a reducer via `useReducer`, and the resulting
  state is rendered declaratively through JSX.
- Any new state transition must be added as a new `ACTIONS` entry and
  a new `case` in the reducer's `switch`, following the existing
  pattern of returning a fresh object with updated fields rather than
  mutating `state` in place.

## 3. Naming conventions

- **Components**: PascalCase file and export names (e.g. `Counter`
  in `Counter.jsx`). One default-exported component per `.jsx` file.
- **Functions and variables**: camelCase (e.g. `formatDisplay`,
  `formatTitle`, `initialState`).
- **Action types**: upper-snake-case string constants collected in a
  single frozen `ACTIONS` object per reducer module (e.g.
  `ACTIONS.INCREMENT`, `ACTIONS.ADD_FOUR`), never as bare string
  literals scattered through component code.
- **Test files**: co-located with the module under test, named
  `<module>.test.js` for plain JS/logic modules and `<Component>.test.jsx`
  for component tests (e.g. `reducer.test.js`, `formatter.test.js`).
- **Files**: one concern per file; a pure logic module and its
  corresponding component or test share the same base name as the
  thing they describe (e.g. `formatter.js` / `formatter.test.js`).

## 4. Test-coverage conventions

- Every pure logic module (`src/reducer.js`, `src/formatter.js`, and
  any future module of the same kind) must have a corresponding
  `*.test.js` file covering its exported behavior, including edge
  cases such as boundary values and unrecognized/guarded inputs
  (e.g. the reducer's default case leaving `state` unchanged).
- Component behavior — rendered output, button/interaction handling,
  and any guard or unrecognized-action behavior visible through the
  UI — must be covered by component tests alongside the unit tests
  for the underlying pure logic.
- Reducer tests must assert both the resulting state shape and, for
  unrecognized actions, that the exact same state reference is
  returned (not just an equal object), and that recognized actions
  never mutate the input state.
- The entire test suite must be runnable with a single command,
  `npm test` (which runs `vitest run`), and must pass before any
  change is considered complete. New modules or components are not
  considered done until their tests are added and the full suite is
  green.

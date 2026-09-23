/**
 * CounterApp — React replacement for the old vanilla-JS dispatch()/render()
 * implementation in counter.js.
 *
 * Loaded as a plain classic <script> (no bundler, no JSX, no module system).
 * Relies on two other globals already having been loaded by counter.html,
 * in this order:
 *   1. React (UMD global, from the react CDN <script>)
 *   2. ReactDOM (UMD global, from the react-dom CDN <script>)
 *   3. counterReducer (plain global function, from src/counterReducer.js)
 *
 * Behavior (see RULES.md):
 *   - State is exactly { c, cc }, starting at { c: 0, cc: 0 }, managed via
 *     React.useReducer(counterReducer, { c: 0, cc: 0 }).
 *   - Each of the five buttons dispatches its own action string
 *     ("INCREMENT" | "DECREMENT" | "RESET" | "ADD_FOUR" | "DOUBLE"); an
 *     unrecognized action would be a no-op per counterReducer's contract.
 *   - The title (#ttl) renders "Counter (N clicks)" from state.cc, matching
 *     the old counter.js's exact string format.
 *   - The value display (#d) gets its CSS class purely from state.c
 *     (value--high for c>10, value--negative for c<0, value--normal
 *     otherwise) — no inline style.color anywhere (R-0006).
 *
 * DOM structure preserved for continuity with RULES.md / later steps:
 *   <div id="counter">
 *     <h1 id="ttl">Counter (N clicks)</h1>
 *     <p id="d" class="value--...">N</p>
 *     <button data-action="INCREMENT">+</button>
 *     <button data-action="DECREMENT">-</button>
 *     <button data-action="RESET">reset</button>
 *     <button data-action="ADD_FOUR">+4</button>
 *     <button data-action="DOUBLE">x2</button>
 *   </div>
 *
 * Dark theme:
 *   - A manual toggle button (id="theme-toggle", data-action="TOGGLE_THEME")
 *     is rendered alongside the five counter buttons but is NOT wired to
 *     the counterReducer/dispatch — it flips its own local
 *     React.useState boolean ("manually dark") and, via a React.useEffect,
 *     sets document.documentElement.setAttribute('data-theme', 'dark')
 *     when true, or removeAttribute('data-theme') when false. This is
 *     independent of the OS-level `prefers-color-scheme: dark` media
 *     query in style.css, which applies automatically when there is no
 *     manual override.
 */
function CounterApp() {
  var state = React.useReducer(counterReducer, { c: 0, cc: 0 });
  var s = state[0];
  var dispatch = state[1];

  var darkState = React.useState(false);
  var manuallyDark = darkState[0];
  var setManuallyDark = darkState[1];

  React.useEffect(function () {
    if (manuallyDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [manuallyDark]);

  function toggleTheme() {
    setManuallyDark(function (prev) {
      return !prev;
    });
  }

  function valueClass(c) {
    if (c > 10) {
      return 'value--high';
    }
    if (c < 0) {
      return 'value--negative';
    }
    return 'value--normal';
  }

  function makeClickHandler(actionType) {
    return function () {
      dispatch(actionType);
    };
  }

  return React.createElement(
    'div',
    { id: 'counter' },
    React.createElement('h1', { id: 'ttl' }, 'Counter (' + s.cc + ' clicks)'),
    React.createElement('p', { id: 'd', className: valueClass(s.c) }, s.c),
    React.createElement(
      'button',
      { 'data-action': 'INCREMENT', onClick: makeClickHandler('INCREMENT') },
      '+'
    ),
    React.createElement(
      'button',
      { 'data-action': 'DECREMENT', onClick: makeClickHandler('DECREMENT') },
      '-'
    ),
    React.createElement(
      'button',
      { 'data-action': 'RESET', onClick: makeClickHandler('RESET') },
      'reset'
    ),
    React.createElement(
      'button',
      { 'data-action': 'ADD_FOUR', onClick: makeClickHandler('ADD_FOUR') },
      '+4'
    ),
    React.createElement(
      'button',
      { 'data-action': 'DOUBLE', onClick: makeClickHandler('DOUBLE') },
      'x2'
    ),
    React.createElement(
      'button',
      { id: 'theme-toggle', 'data-action': 'TOGGLE_THEME', onClick: toggleTheme },
      manuallyDark ? '☀️ Light theme' : '🌙 Dark theme'
    )
  );
}

var __counterAppRoot = ReactDOM.createRoot(document.getElementById('root'));
__counterAppRoot.render(React.createElement(CounterApp));

# RULES.md

This document has two purposes:

1. Describe the lint/format configuration that ships with the Angular
   scaffold (`counter-app`), so contributors know what style rules are
   enforced and how to run them.
2. Restate the legacy `counter.js` behavior contract (see
   `legacy-contract/contract.md` and `legacy-contract/harness.js`) as a
   set of rules that the Angular rewrite — and every change after it —
   must not break.

## 1. Lint / format configuration

### ESLint

The scaffold uses the flat-config format in **`eslint.config.js`** (not
`.eslintrc.json`). It is built with `typescript-eslint`'s `config()`
helper and applies two rule sets:

- For `**/*.ts` files:
  - `eslint.configs.recommended`
  - `tseslint.configs.recommended`
  - `tseslint.configs.stylistic`
  - `angular.configs.tsRecommended`
  - Inline Angular templates are linted too, via
    `angular.processInlineTemplates`.
  - Two project-specific rules are set to `"error"`:
    - `@angular-eslint/directive-selector`: attribute directives must
      use the `app` prefix and `camelCase`.
    - `@angular-eslint/component-selector`: components must use the
      `app` prefix and `kebab-case` element selectors.
- For `**/*.html` files:
  - `angular.configs.templateRecommended`
  - `angular.configs.templateAccessibility`

Run it with the project's configured script (e.g. `npm run lint`, or
`npx eslint .` if no script is defined).

### Prettier

Formatting is configured in **`.prettierrc.json`**:

```json
{
  "singleQuote": true,
  "printWidth": 100
}
```

- `singleQuote: true` — prefer `'single quotes'` over double quotes in
  TypeScript/JavaScript source.
- `printWidth: 100` — wrap lines at 100 characters instead of
  Prettier's default of 80.

All other Prettier options are left at their defaults. Run Prettier via
the project's configured script (e.g. `npm run format`) or
`npx prettier --write .`.

## 2. Behavior contract (must not regress)

The rewrite must preserve the exact observable behavior of the legacy
`counter.js` widget, fully characterized in `legacy-contract/contract.md`
and asserted by `legacy-contract/harness.js`. The following rules are
the enforceable summary of that contract. Any change to the counter
widget — Angular or otherwise — must keep all of these true.

### The five actions

There are exactly five known action codes, one per interactive control.
Each is identified below by its action name as used in the legacy
`ACTION` map and `data-action` attributes:

- **INCREMENT** — clicking `+` increases the counter value by 1
  (`c = c + 1`).
- **DECREMENT** — clicking `-` decreases the counter value by 1
  (`c = c - 1`).
- **RESET** — clicking `reset` sets the counter value back to zero
  (`c = 0`), unconditionally, regardless of its prior value. RESET does
  **not** reset the click counter (`cc` is left untouched by the reset
  itself, other than being incremented like every other successful
  dispatch — see "Click counting" below).
- **ADD_FOUR** — clicking `+4` increases the counter value by 4
  (`c = c + 4`).
- **DOUBLE** — clicking `x2` doubles the current counter value
  (`c = c * 2`).

### The guard

A click whose target does not carry a `data-action` that maps to one of
the five known action codes above (INCREMENT, DECREMENT, RESET,
ADD_FOUR, DOUBLE) is a **no-op**:

- It is logged (for diagnostics only — the exact log text is not part
  of the contract).
- It does **not** change the counter value.
- It does **not** increment the click counter.
- It does **not** trigger a re-render — the DOM (`#d` and `#ttl`) is
  left exactly as it was after the previous successful dispatch, or as
  the initial static markup if there hasn't been one yet.

This covers both a click that never lands on an element with a
`data-action` at all, and a click that lands on an element whose
`data-action` string is not one of the five known actions.

### Click counting

Every **successfully dispatched** action — regardless of which of the
five buttons produced it — increments a separate click counter (`cc`
in the legacy code). This click counter is shown in the page heading
(see below) and is independent of the counter value: RESET can zero the
counter value while the click counter keeps climbing, and an unmapped
(guarded) click increments neither.

### Display-formatting rules

- The displayed counter digit (`#d` in the legacy markup) is colored:
  - **red** when the counter value is greater than 10 (`c > 10`),
  - **blue** when the counter value is negative (`c < 0`),
  - **black** otherwise (`0 <= c <= 10`, i.e. the boundary values `10`
    and `0` are black, not red/blue).
- The heading — the on-page `<h1 id="ttl">` element, **not** the
  browser tab's `document.title` — always shows the literal string
  `"Counter (N clicks)"`, where `N` is the total number of valid
  (successfully dispatched) clicks, i.e. the click counter above. The
  heading always reflects the click counter, never the counter value
  itself.

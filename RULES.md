# RULES.md

This document is the project's enforceable rulebook. It has two parts:

1. **Lint/format configuration** — the ESLint + Prettier setup actually
   wired into the Angular scaffold, and how to run it.
2. **Behavior contract** — the preserved, observable behavior of the
   legacy `counter.js` widget that the Angular rewrite (and every future
   change to it) must not break.

Both parts are normative. Code review and CI should treat a violation of
either as a failing change.

## 1. Lint / format configuration

The scaffold enforces style and correctness with two independent, cooperating
tools:

### ESLint

- Configuration lives in the flat config file **`eslint.config.js`** at the
  repo root (ESLint 9 flat config format, built with `typescript-eslint`'s
  `tseslint.config(...)` helper).
- For `**/*.ts` files it extends:
  - `eslint.configs.recommended` (core ESLint recommended rules)
  - `tseslint.configs.recommended` and `tseslint.configs.stylistic`
    (`typescript-eslint` recommended + stylistic rule sets)
  - `angular.configs.tsRecommended` (`angular-eslint` recommended rules for
    TypeScript)
  - `eslintConfigPrettier` (`eslint-config-prettier`, which turns off any
    ESLint rule that would conflict with Prettier's formatting, so the two
    tools never fight each other)
  - It also registers `angular.processInlineTemplates` as a processor, so
    inline component templates are linted too.
  - Two project-specific rules are set to `"error"`:
    - `@angular-eslint/directive-selector`: attribute selectors must be
      `camelCase` with an `app` prefix.
    - `@angular-eslint/component-selector`: element selectors must be
      `kebab-case` with an `app` prefix.
- For `**/*.html` files it extends `angular.configs.templateRecommended` and
  `angular.configs.templateAccessibility` (Angular template correctness and
  accessibility rules).
- A legacy-style `.eslintrc.json` also exists at the repo root, expressing an
  equivalent rule set (core recommended + `@typescript-eslint/recommended` +
  `@angular-eslint/recommended` + the same two selector rules, plus the
  `@angular-eslint/template` recommended/accessibility rules for `*.html`)
  for tooling that still expects the legacy config format. `eslint.config.js`
  is the config that `ng lint` actually loads.
- Run it with:

  ```
  ng lint
  ```

  (also exposed as `npm run lint`, see `package.json`).

### Prettier

- Configuration lives in **`.prettierrc.json`** at the repo root:
  - `singleQuote: true`
  - `printWidth: 100`
  - `trailingComma: "all"`
  - `tabWidth: 2`
  - `semi: true`
  - `bracketSpacing: true`
  - `arrowParens: "always"`
  - An override sets the `angular` parser for `*.html` files, so Angular
    template syntax is formatted correctly.
- Run it with:

  ```
  npx prettier --check "src/**/*.{ts,html,css}"
  ```

  (also exposed as `npm run format:check`; `npm run format` applies fixes
  with `prettier --write` over the same glob).

`eslint-config-prettier` ensures these two tools stay non-overlapping:
ESLint owns code-quality/correctness rules, Prettier owns formatting.

## 2. Behavior contract

This restates, as enforceable rules, the behavior captured in
`legacy-contract/contract.md` and verified executably by
`legacy-contract/harness.js` (`node legacy-contract/harness.js`) against the
original `counter.js`. The rewrite (and any future change) MUST preserve
every rule below.

There are two pieces of state to preserve conceptually:

- the **counter value** (`c` in the legacy code) — starts at `0`.
- the **click counter** (`cc` in the legacy code) — counts every
  *recognized* dispatched action ("clicks"), starts at `0`.

### 2.1 The five recognized actions

Each of these is triggered by clicking its corresponding button, and each
one, on success, both updates the counter value and increments the click
counter by exactly 1:

| Action | Rule |
|---|---|
| **INCREMENT** | Clicking `+` increases the counter value by 1. |
| **DECREMENT** | Clicking `-` decreases the counter value by 1. |
| **RESET** | Clicking `reset` sets the counter value back to zero, but does **NOT** reset the click counter — the click counter still increments by 1 for the reset click itself. |
| **ADD_FOUR** | Clicking `+4` increases the counter value by 4. |
| **DOUBLE** | Clicking `x2` doubles the current counter value. |

### 2.2 The dispatch guard

A click that does not map to a known action code (no `data-action` on the
target, or a `data-action` value that isn't one of `INCREMENT`, `DECREMENT`,
`RESET`, `ADD_FOUR`, `DOUBLE`) is **ignored**:

- it does **not** change the counter value,
- it does **not** increment the click counter,
- it does **not** trigger a re-render / display update.

### 2.3 Click counting

Every successfully dispatched action (regardless of which of the five
actions it was, including `RESET`) increments the click counter by exactly
1. An unmapped/missing action (see the guard above) never increments the
click counter, even when interleaved between recognized actions.

### 2.4 Display-formatting rules

After every recognized dispatch (and only after a recognized dispatch — see
the guard above), the display must update as follows:

- **Counter digit color:**
  - `red` when the counter value is greater than 10 (`value > 10`).
  - `blue` when the counter value is negative (`value < 0`).
  - `black` otherwise, i.e. for `0 <= value <= 10` inclusive of both
    boundaries (value `== 10` is `black`, not `red`; value `== 0` is
    `black`).
- **Heading / title text:** shows the total number of valid dispatched
  clicks (the click counter, not the counter value), formatted exactly as:

  ```
  Counter (N clicks)
  ```

  where `N` is the current click counter. The grammar ("1 clicks" rather
  than "1 click") is preserved exactly as legacy behavior — no
  pluralization handling is part of the contract.

### 2.5 Non-goals

- Internal logging (e.g. `console.log`/`console.warn` calls in the legacy
  `dispatch()`) is incidental and not part of this contract.
- The exact module wiring/bootstrap mechanism (legacy: a raw
  `addEventListener` on `#counter`; Angular: component event bindings) is an
  implementation detail — only the externally observable behavior above is
  contractual.

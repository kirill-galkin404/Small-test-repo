# small-test-repo

A monorepo containing a single-file counter widget plus the todo apps:

- `counter.html` / `counter.js` — the counter widget (single file, no build step).
- `todo-backend/` — Express + SQLite REST API.
- `todo-frontend/` — Vite + React single-page app for the API.

## Layout

```
.
├── counter.html, counter.js, index.html, style.css   counter widget (no build step)
├── docs/adr/                                          architecture decision records
├── package.json, package-lock.json                    npm workspaces root (the only lockfile)
├── todo-backend/                                      Express + SQLite API
│   ├── server.js, app.js, config.js, seed.js
│   ├── routes/, middleware/, lib/
│   └── test/                                          node:test + supertest
└── todo-frontend/                                     Vite + React app
    ├── vite.config.js
    └── src/
```

The root `package.json` defines npm workspaces for `todo-backend` and
`todo-frontend`. The counter widget does not depend on any workspace package
(see [ADR 0002](docs/adr/0002-monorepo-build-tooling-scope.md)).

## Prerequisites

- Node.js 18 or newer (Vite 5 requires it; the apps are exercised on current
  Node LTS releases) and npm.
- `sqlite3` is a native module. `npm install` normally downloads a prebuilt
  binary for your platform; if none is available it falls back to compiling,
  which needs a C/C++ toolchain and Python (`node-gyp`).

## Setup

From the repository root:

```sh
npm install
```

This installs both workspaces and `concurrently` and uses the single root
`package-lock.json`. Per-package lockfiles are not committed, so if you install
inside a package directory use `--no-package-lock`, for example
`npm install --no-package-lock` in `todo-backend/`.

## Seeding

```sh
npm run seed
```

Creates the demo user **demo / demo** with three lists (Inbox, Work, Home) and
some todos. **Warning:** the seed script first deletes every row in the
`users`, `lists`, `todos` and `tokens` tables of the configured database
(`DB_FILE`), so do not run it against data you want to keep.

## Environment variables

Backend variables are read in `todo-backend/config.js`. An unset or empty
variable falls back to the default; numeric variables that do not parse as an
integer also fall back to the default.

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `3000` | Port the API listens on. |
| `DB_FILE` | `todo-backend/todo.db` | Path of the SQLite database file. |
| `SECRET` | `supersecret123` (development placeholder in `todo-backend/config.js`) | Used only to verify legacy md5 password hashes (see below). **Set your own value in any real deployment.** |
| `TOKEN_TTL_HOURS` | `24` | Lifetime of issued auth tokens, in hours. |
| `ALLOW_ORIGIN` | `*` | Value of the `Access-Control-Allow-Origin` response header. |
| `PAGE_SIZE` | `20` | Number of todos returned per page by `GET /api/todos`. |

Frontend variable (read by `todo-frontend/vite.config.js`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `API_URL` | `http://localhost:3000/api` | Base URL of the API. It is a **build-time** variable: it is baked into the bundle when Vite starts (`npm run dev`) or builds (`npm run build`), so changing it requires restarting the dev server or rebuilding. |

Example:

```sh
SECRET=<your-own-secret> PORT=4000 npm start
API_URL=http://localhost:4000/api npm run build
```

Notes:

- Never commit real secrets. Use your own value for `SECRET` and keep it out of
  version control.
- `SECRET` matters only for users whose password is still a legacy
  `md5(password + SECRET)` hash: it must equal the secret originally used to
  create those hashes, otherwise those users cannot log in. On the first
  successful login such a hash is silently upgraded to bcrypt. After that,
  older md5-based code can no longer log those users in, so rolling back to it
  requires reseeding (or resetting those passwords).
- **`PAGE_SIZE` and the frontend:** the frontend hardcodes a page size of 20
  rows (`todo-frontend/src/pages/TodosPage.jsx`) and disables "Next" when a page
  has fewer than 20 rows. The backend ignores any `limit` query parameter and
  always uses `PAGE_SIZE`. If you change `PAGE_SIZE` without changing the
  frontend constant, paging will disagree (e.g. with `PAGE_SIZE=10`, "Next" is
  disabled on every page because each page has fewer than 20 rows, so pages
  after the first are unreachable; with `PAGE_SIZE=50`, "Next" is enabled
  but the UI and API no longer share one page size).
- The API logs every request with morgan (`dev` format), which can include the
  `?token=` query string. Prefer sending the token in the `X-Auth-Token` header.

## Running

From the repository root:

| Command | What it does |
| --- | --- |
| `npm start` | Starts the API only, on `http://localhost:3000` (`PORT`). |
| `npm run dev` | Starts the API and the Vite dev server together (via `concurrently`). |
| `npm run build` | Builds the frontend (output in `todo-frontend/dist`). |

In development the frontend is at `http://localhost:8080` and talks to the API
at `http://localhost:3000`. A typical first run:

```sh
npm install
npm run seed
npm run dev     # then open http://localhost:8080 and log in as demo / demo
```

The counter widget needs no install or build: open `counter.html` directly in a
browser.

## Testing

From the repository root:

```sh
npm test
```

This runs the test script of each workspace: `node --test` in `todo-backend`
(contract tests using supertest; they do not need a running server) and
`vitest run` in `todo-frontend` (jsdom).

## API contract

Base URL: `http://localhost:3000` (default port 3000). All endpoints below are
under `/api` and exchange JSON. `GET /` returns the plain text
`todo api is running`.

### Authentication

`/api/users/register` and `/api/users/login` return
`{ "token": "...", "user": { ... } }`. Tokens are opaque random 64-character hex
strings, valid for `TOKEN_TTL_HOURS` hours.

Send the token on every other request in the `X-Auth-Token` header (preferred).
The `?token=<token>` query parameter is also accepted but may end up in request
logs.

A missing, unknown or expired token, or a token whose user no longer exists,
gives **401** (`no token`, `bad token`, `token expired`, `user not found`).

### CORS

Every response carries `Access-Control-Allow-Origin` (`ALLOW_ORIGIN`),
`Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token`
and `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`. `OPTIONS`
requests are answered with **200** before authentication.

### Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/users/register` | no | Body `username`, `password`, optional `email`. 400 if username/password missing, 409 if the user exists. Creates an `Inbox` list and returns a token. |
| POST | `/api/users/login` | no | Body `username`, `password`. 401 `wrong username or password` on failure. |
| POST | `/api/users/logout` | yes | Deletes the presented token. |
| GET | `/api/users/me` | yes | Current user (`id`, `username`, `email`, `created_at`). |
| PUT | `/api/users/me` | yes | Update `email` and, optionally, `password`. |
| GET | `/api/lists` | yes | The user's lists, each with `total` and `done` todo counts. |
| POST | `/api/lists` | yes | Body `name` (required, else 400), optional `color`. |
| PUT | `/api/lists/:id` | yes | Update `name` and `color`. |
| DELETE | `/api/lists/:id` | yes | Deletes the list and its todos in one transaction. 404 if missing; 400 for the `Inbox` list. |
| GET | `/api/todos` | yes | Query: `list`, `done` (`0`/`1`), `q` (title/notes search), `tag`, `sort` (`due` or `priority`; default newest first), `page` (1-based). Page size is `PAGE_SIZE`. |
| GET | `/api/todos/:id` | yes | One todo; 404 if not found. |
| POST | `/api/todos` | yes | Body `title` (required, else 400), optional `notes`, `priority`, `due_date`, `tags` (array or comma string), `list_id` (defaults to Inbox). Returns 201. |
| PUT | `/api/todos/:id` | yes | Partial update of the todo fields; 404 if not found. |
| POST | `/api/todos/:id/toggle` | yes | Flips `done`; returns `{ "ok": true }`. |
| DELETE | `/api/todos/:id` | yes | Deletes the todo; 404 if not found. |
| POST | `/api/todos/bulk` | yes | Body `action` (`complete_all` or `clear_done`) and `list_id`; returns `{ ok, changed }`. 400 for an unknown action. |
| GET | `/api/stats` | yes | `total`, `done`, `overdue`, `dueToday`, `percentDone` and per-`tags` counts. |

Todos are returned with `done` as a boolean, `tags` as an array and a computed
`overdue` flag.

## Development notes

The counter widget (`counter.html`, `counter.js`):

- All state (`c`, `cc`, `temp`) and behavior lives in the inline `<script>`
  block in `counter.html`.
- Button click handling uses a single delegated `addEventListener` call keyed
  off each button's `data-action` attribute — there are no inline `onclick`
  handlers.
- `dispatch(x)` is the single entry point for mutating state; every action
  case falls through to a shared tail that increments `cc` and calls
  `render()`.

The counter widget stays single-file with no build step and no dependency on
the workspace packages. See
[docs/adr/0001-single-file-vs-build-step.md](docs/adr/0001-single-file-vs-build-step.md)
for the architectural decision on keeping `counter.html` single-file vs.
introducing a build step, before making any structural changes, and
[docs/adr/0002-monorepo-build-tooling-scope.md](docs/adr/0002-monorepo-build-tooling-scope.md)
for where `package.json` files and bundlers are permitted in this monorepo.

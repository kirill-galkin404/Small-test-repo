import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from './App';
import { SessionProvider } from './session/SessionContext';
import { API_URL } from './config';

function LocationProbe() {
  const { pathname } = useLocation();
  return <div data-testid="location">{pathname}</div>;
}

function renderApp(path) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <LocationProbe />
      </MemoryRouter>
    </SessionProvider>
  );
}

const location = () => screen.getByTestId('location').textContent;
const expectLogin = async () => {
  await waitFor(() => expect(location()).toBe('/login'));
  expect(screen.getByLabelText('Username')).toBeInTheDocument();
};

const USER = { id: 1, username: 'amy', email: 'amy@example.com' };

function signIn() {
  localStorage.setItem('token', 'tok-1');
  localStorage.setItem('user', JSON.stringify(USER));
}

function json(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// A small in-memory API: routes the paths and methods the app calls.
function createApi(overrides = {}) {
  const state = {
    lists: [
      { id: 1, name: 'Inbox', color: '#337ab7', total: 1, done: 0 },
      { id: 2, name: 'Work', color: '#d9534f', total: 0, done: 0 },
    ],
    todos: [
      { id: 10, title: 'Buy milk', done: false, priority: 2, list_id: 1, tags: [], notes: '' },
    ],
    nextId: 100,
    calls: [],
  };

  const recount = () => {
    state.lists.forEach((l) => {
      const mine = state.todos.filter((t) => t.list_id === l.id);
      l.total = mine.length;
      l.done = mine.filter((t) => t.done).length;
    });
  };
  recount();

  const handle = (method, path, body, token) => {
    const key = `${method} ${path}`;
    if (overrides[key]) return overrides[key](body, state, token);
    let m;
    switch (true) {
      case key === 'POST /users/login':
        if (body.password !== 'secret') return json(401, { error: 'Bad credentials' });
        return json(200, { token: 'tok-1', user: { ...USER, username: body.username } });
      case key === 'POST /users/register':
        return json(200, {
          token: 'tok-2',
          user: { id: 2, username: body.username, email: body.email },
        });
      case key === 'POST /users/logout':
        return json(200, { ok: true });
      case key === 'GET /users/me':
        return json(200, { ...USER, created_at: '2024-01-15T00:00:00Z' });
      case key === 'PUT /users/me':
        return json(200, { ...USER, email: body.email });
      case key === 'GET /stats':
        return json(200, {
          total: 7, done: 3, dueToday: 2, overdue: 1, percentDone: 43, tags: { home: 2, work: 5 },
        });
      case key === 'GET /lists':
        recount();
        return json(200, state.lists);
      case key === 'POST /lists': {
        const list = { id: state.nextId++, name: body.name, color: body.color, total: 0, done: 0 };
        state.lists.push(list);
        return json(201, list);
      }
      case method === 'DELETE' && (m = path.match(/^\/lists\/(\d+)$/)) !== null:
        state.lists = state.lists.filter((l) => l.id !== Number(m[1]));
        state.todos = state.todos.filter((t) => t.list_id !== Number(m[1]));
        return json(200, { ok: true });
      case key === 'GET /todos': {
        return json(200, state.todos.filter((t) => t.list_id === state.requestedList));
      }
      case key === 'POST /todos': {
        const todo = { id: state.nextId++, done: false, notes: '', tags: [], ...body };
        state.todos.unshift(todo);
        return json(201, todo);
      }
      case method === 'GET' && (m = path.match(/^\/todos\/(\d+)$/)) !== null:
        return json(200, state.todos.find((t) => t.id === Number(m[1])));
      case method === 'PUT' && (m = path.match(/^\/todos\/(\d+)$/)) !== null: {
        const todo = state.todos.find((t) => t.id === Number(m[1]));
        Object.assign(todo, body);
        return json(200, todo);
      }
      case method === 'POST' && (m = path.match(/^\/todos\/(\d+)\/toggle$/)) !== null: {
        const todo = state.todos.find((t) => t.id === Number(m[1]));
        todo.done = !todo.done;
        return json(200, todo);
      }
      default:
        return json(404, { error: `no route for ${key}` });
    }
  };

  const fetchStub = vi.fn(async (url, init = {}) => {
    const u = new URL(url);
    const path = u.pathname.slice(new URL(API_URL).pathname.length);
    const method = init.method || 'GET';
    const body = init.body ? JSON.parse(init.body) : undefined;
    const token = init.headers && init.headers['X-Auth-Token'];
    if (path === '/todos' && method === 'GET') {
      const list = u.searchParams.get('list');
      state.requestedList = list === null ? null : Number(list);
    }
    state.calls.push({ method, path, body, token, search: u.search });
    return handle(method, path, body, token);
  });

  return { state, fetchStub };
}

describe('App workflows', () => {
  let api;

  beforeEach(() => {
    localStorage.clear();
    api = createApi();
    vi.stubGlobal('fetch', api.fetchStub);
    vi.stubGlobal('confirm', vi.fn(() => true));
    vi.stubGlobal('alert', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const useApi = (overrides) => {
    api = createApi(overrides);
    vi.stubGlobal('fetch', api.fetchStub);
  };

  describe('route guard', () => {
    it.each(['/todos', '/todos/10', '/stats', '/settings'])(
      'redirects tokenless %s to /login',
      async (path) => {
        renderApp(path);
        await expectLogin();
        expect(api.fetchStub).not.toHaveBeenCalled();
      }
    );

    it('redirects an unknown path to /todos and then /login when tokenless', async () => {
      renderApp('/nope/nothing');
      await expectLogin();
    });

    it('redirects an unknown path to /todos when signed in', async () => {
      signIn();
      renderApp('/nope/nothing');
      await waitFor(() => expect(location()).toBe('/todos'));
      expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    });

    it('keeps /login and /register public', async () => {
      renderApp('/register');
      expect(location()).toBe('/register');
      expect(screen.getByLabelText('Repeat password')).toBeInTheDocument();
    });
  });

  describe('auth flows', () => {
    it('logs in and lands on the todo list, sending X-Auth-Token afterwards', async () => {
      const user = userEvent.setup();
      renderApp('/login');
      await user.type(screen.getByLabelText('Username'), 'amy');
      await user.type(screen.getByLabelText('Password'), 'secret');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => expect(location()).toBe('/todos'));
      expect(await screen.findByText('Buy milk')).toBeInTheDocument();
      expect(screen.getByText('Hi, amy')).toBeInTheDocument();
      expect(localStorage.getItem('token')).toBe('tok-1');
      expect(JSON.parse(localStorage.getItem('user')).username).toBe('amy');

      const loginCall = api.state.calls.find((c) => c.path === '/users/login');
      expect(loginCall.token).toBeUndefined();
      expect(loginCall.body).toEqual({ username: 'amy', password: 'secret' });
      const listsCall = api.state.calls.find((c) => c.path === '/lists');
      expect(listsCall.token).toBe('tok-1');
    });

    it('shows an error and stays on /login for bad credentials', async () => {
      const user = userEvent.setup();
      renderApp('/login');
      await user.type(screen.getByLabelText('Username'), 'amy');
      await user.type(screen.getByLabelText('Password'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
      expect(await screen.findByText('Bad credentials')).toBeInTheDocument();
      expect(location()).toBe('/login');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('registers a new user and lands on the todo list', async () => {
      const user = userEvent.setup();
      renderApp('/login');
      await user.click(screen.getByRole('link', { name: 'Register' }));
      expect(location()).toBe('/register');

      await user.type(screen.getByLabelText('Username'), 'bob');
      await user.type(screen.getByLabelText('Email'), 'bob@example.com');
      await user.type(screen.getByLabelText('Password'), 'pw123');
      await user.type(screen.getByLabelText('Repeat password'), 'pw123');
      await user.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => expect(location()).toBe('/todos'));
      const call = api.state.calls.find((c) => c.path === '/users/register');
      expect(call.body).toEqual({ username: 'bob', password: 'pw123', email: 'bob@example.com' });
      expect(localStorage.getItem('token')).toBe('tok-2');
      expect(await screen.findByText('Hi, bob')).toBeInTheDocument();
    });

    it('rejects mismatched registration passwords without calling the API', async () => {
      const user = userEvent.setup();
      renderApp('/register');
      await user.type(screen.getByLabelText('Username'), 'bob');
      await user.type(screen.getByLabelText('Password'), 'pw123');
      await user.type(screen.getByLabelText('Repeat password'), 'other');
      await user.click(screen.getByRole('button', { name: 'Register' }));
      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
      expect(api.fetchStub).not.toHaveBeenCalled();
    });

    it('logout posts to /users/logout, clears storage and ends on /login', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByRole('link', { name: 'Logout' }));

      await expectLogin();
      const call = api.state.calls.find((c) => c.path === '/users/logout');
      expect(call.method).toBe('POST');
      expect(call.token).toBe('tok-1');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.queryByText('Hi, amy')).not.toBeInTheDocument();
    });

    it('logout still clears the session and ends on /login when the server fails', async () => {
      useApi({ 'POST /users/logout': () => json(500, { error: 'boom' }) });
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByRole('link', { name: 'Logout' }));

      await expectLogin();
      expect(api.state.calls.some((c) => c.path === '/users/logout')).toBe(true);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('logout clears the session even when the request itself rejects', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      const original = api.fetchStub.getMockImplementation();
      api.fetchStub.mockImplementation(async (url, init) => {
        if (String(url).endsWith('/users/logout')) throw new TypeError('network down');
        return original(url, init);
      });
      await user.click(screen.getByRole('link', { name: 'Logout' }));
      await expectLogin();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('401 mid-session', () => {
    it('clears token and user and shows /login when a request returns 401', async () => {
      useApi({ 'GET /lists': () => json(401, { error: 'Unauthorized' }) });
      signIn();
      renderApp('/todos');
      await expectLogin();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.queryByText('Hi, amy')).not.toBeInTheDocument();
    });

    it('handles a 401 after the page has loaded (toggle)', async () => {
      useApi({ 'POST /todos/10/toggle': () => json(401, { error: 'Unauthorized' }) });
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByRole('checkbox'));
      await expectLogin();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('handles a 401 on the stats page', async () => {
      useApi({ 'GET /stats': () => json(401, { error: 'Unauthorized' }) });
      signIn();
      renderApp('/stats');
      await expectLogin();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('todos', () => {
    it('adds a todo to the selected list', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');

      await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Walk dog');
      await user.type(screen.getByPlaceholderText('tags'), 'home, pets');
      await user.selectOptions(screen.getByLabelText('Priority'), 'High');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(await screen.findByText('Walk dog')).toBeInTheDocument();
      const call = api.state.calls.find((c) => c.method === 'POST' && c.path === '/todos');
      expect(call.body).toMatchObject({
        title: 'Walk dog', priority: 3, list_id: 1, tags: ['home', 'pets'],
      });
      expect(call.token).toBe('tok-1');
      expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('');
    });

    it('edits a todo through the edit page and returns to the list', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByLabelText('Edit'));

      await waitFor(() => expect(location()).toBe('/todos/10'));
      const title = await screen.findByLabelText('Title');
      expect(title).toHaveValue('Buy milk');
      await user.clear(title);
      await user.type(title, 'Buy oat milk');
      await user.type(screen.getByLabelText('Notes'), 'two cartons');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(location()).toBe('/todos'));
      expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
      expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
      const put = api.state.calls.find((c) => c.method === 'PUT' && c.path === '/todos/10');
      expect(put.body).toMatchObject({ title: 'Buy oat milk', notes: 'two cartons', list_id: 1 });
    });

    it('toggles a todo done and back', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      const box = screen.getByRole('checkbox');
      expect(box).not.toBeChecked();

      await user.click(box);
      expect(box).toBeChecked();
      await waitFor(() =>
        expect(api.state.calls.filter((c) => c.path === '/todos/10/toggle')).toHaveLength(1)
      );
      expect(api.state.todos[0].done).toBe(true);
      await waitFor(() => expect(screen.getByText('1 / 1 done')).toBeInTheDocument());

      await user.click(box);
      expect(box).not.toBeChecked();
      await waitFor(() => expect(api.state.todos[0].done).toBe(false));
    });

    it('deletes a todo after confirmation', async () => {
      useApi({
        'DELETE /todos/10': (body, state) => {
          state.todos = state.todos.filter((t) => t.id !== 10);
          return json(200, { ok: true });
        },
      });
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByLabelText('Delete'));
      await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
      expect(window.confirm).toHaveBeenCalled();
    });
  });

  describe('lists', () => {
    it('creates a list from the modal and selects it', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');

      await user.click(screen.getByRole('button', { name: /New list/ }));
      await user.type(screen.getByLabelText('Name'), 'Errands');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      const heading = await screen.findByRole('heading', { level: 3, name: /Errands/ });
      expect(heading).toBeInTheDocument();
      const call = api.state.calls.find((c) => c.method === 'POST' && c.path === '/lists');
      expect(call.body).toMatchObject({ name: 'Errands' });
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
      expect(screen.getByText('Nothing here.')).toBeInTheDocument();
    });

    it('deletes a non-Inbox list after confirmation', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      expect(screen.queryByText('Delete this list')).not.toBeInTheDocument();

      await user.click(screen.getByText('Work'));
      await user.click(await screen.findByRole('button', { name: 'Delete this list' }));

      await waitFor(() =>
        expect(api.state.calls.some((c) => c.method === 'DELETE' && c.path === '/lists/2')).toBe(true)
      );
      await waitFor(() => expect(screen.queryByText('Work')).not.toBeInTheDocument());
      expect(window.confirm).toHaveBeenCalled();
      expect(location()).toBe('/todos');
    });
  });

  describe('stats and settings', () => {
    it('shows the stats from the API', async () => {
      signIn();
      renderApp('/stats');
      const total = (await screen.findByText('Total')).closest('.panel-body');
      expect(within(total).getByText('7')).toBeInTheDocument();
      expect(within(screen.getByText('Done', { selector: '.panel-body' })).getByText('3')).toBeInTheDocument();
      expect(screen.getByText('43%')).toBeInTheDocument();
      expect(screen.getByText('#work')).toBeInTheDocument();
      expect(screen.getByText('#home')).toBeInTheDocument();
      expect(api.state.calls.find((c) => c.path === '/stats').token).toBe('tok-1');
    });

    it('navigates between sections through the navbar', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/todos');
      await screen.findByText('Buy milk');
      await user.click(screen.getByRole('link', { name: 'Stats' }));
      expect(location()).toBe('/stats');
      await user.click(screen.getByRole('link', { name: 'Settings' }));
      expect(location()).toBe('/settings');
    });

    it('saves settings and updates the stored user', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/settings');
      const email = await screen.findByLabelText('Email');
      await waitFor(() => expect(email).toHaveValue('amy@example.com'));

      await user.clear(email);
      await user.type(email, 'new@example.com');
      await user.type(screen.getByLabelText('New password'), 'newpw');
      await user.type(screen.getByLabelText('Repeat new password'), 'newpw');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Saved!')).toBeInTheDocument();
      const put = api.state.calls.find((c) => c.method === 'PUT' && c.path === '/users/me');
      expect(put.body).toEqual({ email: 'new@example.com', password: 'newpw' });
      expect(JSON.parse(localStorage.getItem('user')).email).toBe('new@example.com');
      expect(location()).toBe('/settings');
    });

    it('does not save settings when the passwords differ', async () => {
      signIn();
      const user = userEvent.setup();
      renderApp('/settings');
      await waitFor(() => expect(screen.getByLabelText('Email')).toHaveValue('amy@example.com'));
      await user.type(screen.getByLabelText('New password'), 'a');
      await user.type(screen.getByLabelText('Repeat new password'), 'b');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
      expect(api.state.calls.some((c) => c.method === 'PUT')).toBe(false);
    });
  });
});

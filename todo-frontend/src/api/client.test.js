import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { request, setUnauthorizedHandler } from './client';
import { listTodos, bulkTodos, toggleTodo } from './endpoints';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  };
}

describe('api client', () => {
  let fetchMock;
  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    setUnauthorizedHandler(null);
    vi.unstubAllGlobals();
  });

  it('sends X-Auth-Token when a token exists', async () => {
    localStorage.setItem('token', 'abc');
    await request('GET', '/todos');
    expect(fetchMock.mock.calls[0][1].headers['X-Auth-Token']).toBe('abc');
  });

  it('omits X-Auth-Token without a token', async () => {
    await request('GET', '/todos');
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('X-Auth-Token');
  });

  it('sends JSON bodies and builds query strings skipping empty values', async () => {
    await listTodos({ page: 2, list: 5, done: false, q: undefined, tag: null, sort: '' });
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/todos\?/);
    const qs = new URLSearchParams(url.split('?')[1]);
    expect(Object.fromEntries(qs)).toEqual({ page: '2', list: '5', done: 'false', sort: '' });

    await bulkTodos('complete_all', 3);
    const init = fetchMock.mock.calls[1][1];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({ action: 'complete_all', list_id: 3 });

    await toggleTodo(9);
    expect(fetchMock.mock.calls[2][0]).toMatch(/\/todos\/9\/toggle$/);
  });

  it('clears the session and calls the handler on 401', async () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', '{"id":1}');
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValue(jsonResponse(401, { error: 'Unauthorized' }));
    await expect(request('GET', '/todos')).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('rejects with status, server message and data', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: 'Bad title' }));
    const err = await request('POST', '/todos', { body: {} }).catch((e) => e);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Bad title');
    expect(err.data).toEqual({ error: 'Bad title' });
  });

  it('falls back to a generic message and tolerates empty bodies', async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, undefined));
    const err = await request('GET', '/x').catch((e) => e);
    expect(err.status).toBe(500);
    expect(err.message).toMatch(/500/);
    fetchMock.mockResolvedValue(jsonResponse(204, undefined));
    await expect(request('DELETE', '/x')).resolves.toBeNull();
  });
});

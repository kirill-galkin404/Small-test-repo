import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { SessionProvider, useSession } from './SessionContext';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  };
}

let session;
function Probe() {
  session = useSession();
  return <div data-testid="who">{session.user ? session.user.username : 'anon'}</div>;
}

function setup() {
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>
  );
}

describe('SessionProvider', () => {
  let fetchMock;
  beforeEach(() => {
    localStorage.clear();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('initialises from localStorage', () => {
    localStorage.setItem('token', 't0');
    localStorage.setItem('user', JSON.stringify({ username: 'zed' }));
    setup();
    expect(session.token).toBe('t0');
    expect(screen.getByTestId('who')).toHaveTextContent('zed');
  });

  it('login stores token and user', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { token: 'tok', user: { id: 1, username: 'amy' } }));
    setup();
    await act(() => session.login('amy', 'pw'));
    expect(localStorage.getItem('token')).toBe('tok');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ id: 1, username: 'amy' });
    expect(screen.getByTestId('who')).toHaveTextContent('amy');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ username: 'amy', password: 'pw' });
  });

  it('register stores token and user', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { token: 'rt', user: { id: 2, username: 'bob' } }));
    setup();
    await act(() => session.register('bob', 'pw', 'b@x.io'));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ username: 'bob', password: 'pw', email: 'b@x.io' });
    expect(localStorage.getItem('token')).toBe('rt');
    expect(session.token).toBe('rt');
  });

  it('failed login rejects with the server error and stores nothing', async () => {
    fetchMock.mockResolvedValue(jsonResponse(400, { error: 'Invalid credentials' }));
    setup();
    await expect(act(() => session.login('a', 'b'))).rejects.toMatchObject({ message: 'Invalid credentials' });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('logout clears the session', async () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ username: 'amy' }));
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    setup();
    await act(() => session.logout());
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/users\/logout$/);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(session.token).toBeNull();
    expect(screen.getByTestId('who')).toHaveTextContent('anon');
  });

  it('logout clears the session even when the server call fails', async () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ username: 'amy' }));
    fetchMock.mockRejectedValue(new Error('network down'));
    setup();
    await act(() => session.logout());
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(session.token).toBeNull();
  });

  it('a 401 from any request clears the session state', async () => {
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ username: 'amy' }));
    fetchMock.mockResolvedValue(jsonResponse(401, { error: 'nope' }));
    setup();
    const { getStats } = await import('../api/endpoints');
    await act(() => getStats().catch(() => {}));
    await waitFor(() => expect(session.token).toBeNull());
    expect(session.user).toBeNull();
  });

  it('updateUser persists the user', () => {
    setup();
    act(() => session.updateUser({ id: 1, username: 'amy', email: 'n@x.io' }));
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('n@x.io');
    expect(session.user.email).toBe('n@x.io');
  });
});

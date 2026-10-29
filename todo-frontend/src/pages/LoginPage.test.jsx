import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';

const login = vi.fn();
vi.mock('../session/SessionContext', () => ({ useSession: () => ({ login }) }));

function setup() {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<div>register page</div>} />
        <Route path="/todos" element={<div>todos page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fill(user) {
  await user.type(screen.getByLabelText('Username'), 'amy');
  await user.type(screen.getByLabelText('Password'), 'secret');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
  });

  it('logs in and navigates to /todos', async () => {
    login.mockResolvedValue({});
    const user = userEvent.setup();
    setup();
    await fill(user);
    expect(login).toHaveBeenCalledWith('amy', 'secret');
    expect(await screen.findByText('todos page')).toBeInTheDocument();
  });

  it('shows the server error', async () => {
    login.mockRejectedValue(Object.assign(new Error('x'), { data: { error: 'Bad credentials' } }));
    const user = userEvent.setup();
    setup();
    await fill(user);
    expect(await screen.findByText('Bad credentials')).toBeInTheDocument();
  });

  it("shows 'Login failed' without a server message", async () => {
    login.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    setup();
    await fill(user);
    expect(await screen.findByText('Login failed')).toBeInTheDocument();
  });

  it('disables the button while loading', async () => {
    let resolve;
    login.mockReturnValue(new Promise((r) => { resolve = r; }));
    const user = userEvent.setup();
    setup();
    await fill(user);
    const button = screen.getByRole('button', { name: 'Signing in...' });
    expect(button).toBeDisabled();
    resolve({});
    await waitFor(() => expect(screen.getByText('todos page')).toBeInTheDocument());
  });

  it('links to /register', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('link', { name: 'Register' }));
    expect(screen.getByText('register page')).toBeInTheDocument();
  });
});

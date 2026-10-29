import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage';

const register = vi.fn();
vi.mock('../session/SessionContext', () => ({ useSession: () => ({ register }) }));

function setup() {
  render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/todos" element={<div>todos page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fill(user, pw, pw2) {
  await user.type(screen.getByLabelText('Username'), 'amy');
  await user.type(screen.getByLabelText('Email'), 'amy@example.com');
  await user.type(screen.getByLabelText('Password'), pw);
  await user.type(screen.getByLabelText('Repeat password'), pw2);
  await user.click(screen.getByRole('button', { name: 'Register' }));
}

describe('RegisterPage', () => {
  beforeEach(() => {
    register.mockReset();
  });

  it('blocks mismatched passwords', async () => {
    const user = userEvent.setup();
    setup();
    await fill(user, 'abcd', 'abce');
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('blocks short passwords', async () => {
    const user = userEvent.setup();
    setup();
    await fill(user, 'ab', 'ab');
    expect(screen.getByText('Password too short')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('registers and navigates to /todos', async () => {
    register.mockResolvedValue({});
    const user = userEvent.setup();
    setup();
    await fill(user, 'abc', 'abc');
    expect(register).toHaveBeenCalledWith('amy', 'abc', 'amy@example.com');
    expect(await screen.findByText('todos page')).toBeInTheDocument();
  });

  it('shows the server error', async () => {
    register.mockRejectedValue(Object.assign(new Error('x'), { data: { error: 'Username taken' } }));
    const user = userEvent.setup();
    setup();
    await fill(user, 'abc', 'abc');
    expect(await screen.findByText('Username taken')).toBeInTheDocument();
  });

  it('shows a fallback error', async () => {
    register.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    setup();
    await fill(user, 'abc', 'abc');
    expect(await screen.findByText('Registration failed')).toBeInTheDocument();
  });

  it('links back to sign in', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('link', { name: 'Back to sign in' }));
    expect(screen.getByText('login page')).toBeInTheDocument();
  });
});

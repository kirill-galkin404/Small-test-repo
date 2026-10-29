import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { SessionProvider } from '../session/SessionContext';

function renderAt(path) {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route path="/register" element={<div>register page</div>} />
          <Route
            path="/todos"
            element={
              <RequireAuth>
                <div>secret todos</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </SessionProvider>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => localStorage.clear());

  it('redirects to /login without a token', () => {
    renderAt('/todos');
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret todos')).not.toBeInTheDocument();
  });

  it('renders children with a token', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ username: 'amy' }));
    renderAt('/todos');
    expect(screen.getByText('secret todos')).toBeInTheDocument();
  });

  it('leaves public routes unwrapped', () => {
    renderAt('/register');
    expect(screen.getByText('register page')).toBeInTheDocument();
  });
});

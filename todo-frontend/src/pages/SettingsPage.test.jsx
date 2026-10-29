import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';
import { SessionProvider } from '../session/SessionContext';
import { getMe, updateMe } from '../api/endpoints';

vi.mock('../api/endpoints', () => ({
  getMe: vi.fn(),
  updateMe: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
}));

function setup() {
  render(
    <SessionProvider>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </SessionProvider>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'tok');
    localStorage.setItem('user', JSON.stringify({ id: 1, username: 'amy', email: 'old@example.com' }));
    getMe.mockResolvedValue({ username: 'amy', email: 'old@example.com', created_at: '2024-03-05T10:00:00Z' });
  });

  it('loads the current user', async () => {
    setup();
    expect(await screen.findByText('amy')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('old@example.com');
  });

  it('blocks mismatched passwords', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByText('amy');
    await user.type(screen.getByLabelText('New password'), 'abc');
    await user.type(screen.getByLabelText('Repeat new password'), 'abd');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(updateMe).not.toHaveBeenCalled();
  });

  it('saves, updates stored email and clears password fields', async () => {
    updateMe.mockResolvedValue({});
    const user = userEvent.setup();
    setup();
    await screen.findByText('amy');
    const email = screen.getByLabelText('Email');
    await user.clear(email);
    await user.type(email, 'new@example.com');
    await user.type(screen.getByLabelText('New password'), 'abc');
    await user.type(screen.getByLabelText('Repeat new password'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved!')).toBeInTheDocument();
    expect(updateMe).toHaveBeenCalledWith({ email: 'new@example.com', password: 'abc' });
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('new@example.com');
    expect(JSON.parse(localStorage.getItem('user')).username).toBe('amy');
    expect(screen.getByLabelText('New password')).toHaveValue('');
    expect(screen.getByLabelText('Repeat new password')).toHaveValue('');
  });

  it('sends only the email when no password is entered', async () => {
    updateMe.mockResolvedValue({});
    const user = userEvent.setup();
    setup();
    await screen.findByText('amy');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Saved!')).toBeInTheDocument();
    expect(updateMe).toHaveBeenCalledWith({ email: 'old@example.com' });
  });

  it('shows an error when saving fails', async () => {
    updateMe.mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    setup();
    await screen.findByText('amy');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Error saving settings')).toBeInTheDocument();
  });
});

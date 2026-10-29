import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import StatsPage from './StatsPage';
import { getStats } from '../api/endpoints';

vi.mock('../api/endpoints', () => ({ getStats: vi.fn() }));

describe('StatsPage', () => {
  it('shows totals, progress and tags ordered by count', async () => {
    getStats.mockResolvedValue({
      total: 10,
      done: 4,
      overdue: 1,
      dueToday: 2,
      percentDone: 40,
      tags: { home: 1, work: 5, misc: 3 },
    });
    render(<StatsPage />);
    expect(await screen.findByText('Due today')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows.map((r) => r.textContent)).toEqual(['#work5', '#misc3', '#home1']);
  });

  it('shows a placeholder when there are no tags', async () => {
    getStats.mockResolvedValue({ total: 0, done: 0, overdue: 0, dueToday: 0, percentDone: 0, tags: {} });
    render(<StatsPage />);
    expect(await screen.findByText('No tags yet')).toBeInTheDocument();
  });
});

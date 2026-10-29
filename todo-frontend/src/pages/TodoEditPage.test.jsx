import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TodoEditPage from './TodoEditPage';
import { getTodo, listLists, updateTodo } from '../api/endpoints';

vi.mock('../api/endpoints', () => ({
  getTodo: vi.fn(),
  listLists: vi.fn(),
  updateTodo: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/todos/7']}>
      <Routes>
        <Route path="/todos" element={<div>todos page</div>} />
        <Route path="/todos/:id" element={<TodoEditPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const todo = {
  id: 7,
  title: 'Write tests',
  notes: 'soon',
  priority: 2,
  list_id: 1,
  done: false,
  due_date: '2030-05-06',
  tags: ['a', 'b'],
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2020-01-02T00:00:00Z',
};

describe('TodoEditPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listLists.mockResolvedValue([
      { id: 1, name: 'Inbox' },
      { id: 2, name: 'Work' },
    ]);
  });

  it('loads the todo, saves integer priority and YYYY-MM-DD date, then returns to /todos', async () => {
    getTodo.mockResolvedValue(todo);
    updateTodo.mockResolvedValue({});
    const user = userEvent.setup();
    renderPage();
    const title = await screen.findByLabelText('Title');
    expect(title).toHaveValue('Write tests');
    expect(screen.getByLabelText('Tags (comma separated)')).toHaveValue('a, b');
    expect(getTodo).toHaveBeenCalledWith('7');

    await user.selectOptions(screen.getByLabelText('Priority'), 'High');
    await user.clear(screen.getByLabelText('Tags (comma separated)'));
    await user.type(screen.getByLabelText('Tags (comma separated)'), 'x, y ,z');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByText('todos page')).toBeInTheDocument());
    expect(updateTodo).toHaveBeenCalledWith(7, {
      title: 'Write tests',
      notes: 'soon',
      priority: 3,
      list_id: 1,
      done: false,
      due_date: '2030-05-06',
      tags: ['x', 'y', 'z'],
    });
  });

  it('sends a null due date when cleared and shows an error when save fails', async () => {
    getTodo.mockResolvedValue(todo);
    updateTodo.mockRejectedValue(new Error('nope'));
    const user = userEvent.setup();
    renderPage();
    await user.clear(await screen.findByLabelText('Due date'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(updateTodo.mock.calls[0][1].due_date).toBeNull();
  });

  it('redirects to /todos when the todo cannot be loaded', async () => {
    getTodo.mockRejectedValue(new Error('404'));
    renderPage();
    expect(await screen.findByText('todos page')).toBeInTheDocument();
  });

  it('Cancel returns to /todos', async () => {
    getTodo.mockResolvedValue(todo);
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('todos page')).toBeInTheDocument();
    expect(updateTodo).not.toHaveBeenCalled();
  });
});

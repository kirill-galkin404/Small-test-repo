import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TodosPage from './TodosPage';
import * as api from '../api/endpoints';

vi.mock('../api/endpoints', () => ({
  listTodos: vi.fn(),
  createTodo: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
  bulkTodos: vi.fn(),
  listLists: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
}));

const inbox = { id: 1, name: 'Inbox', color: '#111111', total: 3, done: 1 };
const work = { id: 2, name: 'Work', color: '#222222', total: 2, done: 0 };

const t = (id, extra = {}) => ({
  id,
  title: 'Todo ' + id,
  priority: 2,
  done: false,
  tags: [],
  ...extra,
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/todos']}>
      <Routes>
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/todos/:id" element={<div>edit page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const lastParams = () => api.listTodos.mock.calls[api.listTodos.mock.calls.length - 1][0];

describe('TodosPage', () => {
  let confirmSpy;
  let alertSpy;

  beforeEach(() => {
    vi.resetAllMocks();
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.listLists.mockResolvedValue([inbox, work]);
    api.listTodos.mockResolvedValue([t(1, { tags: ['home'], priority: 3 }), t(2, { done: true })]);
  });

  afterEach(() => vi.restoreAllMocks());

  it('loads lists, selects the first and shows its todos', async () => {
    renderPage();
    expect(await screen.findByText('Todo 1')).toBeInTheDocument();
    expect(lastParams()).toMatchObject({ list: 1, page: 1 });
    expect(screen.getByText('1 / 3 done')).toBeInTheDocument();
    expect(within(screen.getByText('Todo 1').closest('li')).getByText('High')).toBeInTheDocument();
    expect(screen.getByText('#home')).toBeInTheDocument();
  });

  it('selects another list and resets the page', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    await user.click(screen.getByText('Work'));
    await waitFor(() => expect(lastParams()).toMatchObject({ list: 2, page: 1 }));
  });

  it('filters by done, sort, search text and tag', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');

    await user.selectOptions(screen.getByLabelText('Done filter'), 'Active');
    await waitFor(() => expect(lastParams()).toMatchObject({ done: '0', page: 1 }));

    await user.selectOptions(screen.getByLabelText('Sort'), 'Priority');
    await waitFor(() => expect(lastParams()).toMatchObject({ sort: 'priority', done: '0' }));

    await user.type(screen.getByPlaceholderText('Search...'), 'milk');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(lastParams()).toMatchObject({ q: 'milk', sort: 'priority' }));

    await user.click(screen.getByText('#home'));
    await waitFor(() => expect(lastParams()).toMatchObject({ tag: 'home', q: 'milk' }));

    await user.click(screen.getByLabelText('Clear tag'));
    await waitFor(() => expect(lastParams().tag).toBeUndefined());
  });

  it('pages forward and back; Next is disabled with fewer than 20 rows', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    const next = screen.getByText(/Next/).closest('li');
    expect(next).toHaveClass('disabled');
    const calls = api.listTodos.mock.calls.length;
    await user.click(screen.getByText(/Next/));
    expect(api.listTodos.mock.calls.length).toBe(calls);

    api.listTodos.mockResolvedValue(Array.from({ length: 20 }, (_, i) => t(i + 100)));
    await user.click(screen.getByText('Work'));
    await screen.findByText('Todo 100');
    expect(screen.getByText(/Next/).closest('li')).not.toHaveClass('disabled');
    await user.click(screen.getByText(/Next/));
    await waitFor(() => expect(lastParams()).toMatchObject({ list: 2, page: 2 }));
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    await user.click(screen.getByText(/Prev/));
    await waitFor(() => expect(lastParams()).toMatchObject({ page: 1 }));
  });

  it('adds a todo with default priority 2, trimmed tags and formatted date; ignores empty title', async () => {
    api.createTodo.mockResolvedValue(t(9, { title: 'Buy milk' }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');

    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(api.createTodo).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'Buy milk');
    await user.type(screen.getByPlaceholderText('tags'), ' a , b ,c');
    await user.type(screen.getByLabelText('Due date'), '2030-01-02');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(api.createTodo).toHaveBeenCalledWith({
      title: 'Buy milk',
      priority: 2,
      list_id: 1,
      tags: ['a', 'b', 'c'],
      due_date: '2030-01-02',
    });
    expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('');
  });

  it('alerts when creating a todo fails', async () => {
    api.createTodo.mockRejectedValue(Object.assign(new Error('x'), { data: { error: 'bad title' } }));
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    await user.type(screen.getByPlaceholderText('What needs to be done?'), 'x');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Error: bad title'));
  });

  it('toggles a todo and reverts when the call fails', async () => {
    const user = userEvent.setup();
    api.toggleTodo.mockResolvedValueOnce({});
    renderPage();
    await screen.findByText('Todo 1');
    const box = screen.getAllByRole('checkbox')[0];
    await user.click(box);
    expect(api.toggleTodo).toHaveBeenCalledWith(1);
    expect(box).toBeChecked();

    api.toggleTodo.mockRejectedValueOnce(new Error('x'));
    await user.click(box);
    await waitFor(() => expect(box).toBeChecked());
  });

  it('deletes a todo only after confirmation', async () => {
    api.deleteTodo.mockResolvedValue({});
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    const row = screen.getByText('Todo 1').closest('li');

    confirmSpy.mockReturnValueOnce(false);
    await user.click(within(row).getByLabelText('Delete'));
    expect(api.deleteTodo).not.toHaveBeenCalled();

    await user.click(within(row).getByLabelText('Delete'));
    expect(confirmSpy).toHaveBeenLastCalledWith('Delete "Todo 1"?');
    await waitFor(() => expect(screen.queryByText('Todo 1')).not.toBeInTheDocument());
    expect(api.deleteTodo).toHaveBeenCalledWith(1);
  });

  it('Complete all runs without confirmation; Clear completed asks first', async () => {
    api.bulkTodos.mockResolvedValue({});
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');

    await user.click(screen.getByRole('button', { name: 'Complete all' }));
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(api.bulkTodos).toHaveBeenCalledWith('complete_all', 1);

    confirmSpy.mockReturnValueOnce(false);
    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(api.bulkTodos).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Clear completed' }));
    expect(api.bulkTodos).toHaveBeenLastCalledWith('clear_done', 1);
  });

  it('opens and closes the new-list modal from state, and creates a list', async () => {
    api.createList.mockResolvedValue({ id: 3, name: 'Fun', color: '#ff0000', total: 0, done: 0 });
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /New list/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /New list/ }));
    await user.type(screen.getByLabelText('Name'), 'Fun');
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(api.createList).toHaveBeenCalledWith({ name: 'Fun', color: '#337ab7' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(lastParams()).toMatchObject({ list: 3, page: 1 }));
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Fun');
  });

  it('hides Delete list for Inbox; deleting another list confirms and alerts server errors', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    expect(screen.queryByText('Delete this list')).not.toBeInTheDocument();

    await user.click(screen.getByText('Work'));
    confirmSpy.mockReturnValueOnce(false);
    await user.click(await screen.findByText('Delete this list'));
    expect(confirmSpy).toHaveBeenLastCalledWith('Delete list "Work" and all its todos?');
    expect(api.deleteList).not.toHaveBeenCalled();

    api.deleteList.mockRejectedValueOnce(Object.assign(new Error('x'), { data: { error: 'Cannot delete' } }));
    await user.click(screen.getByText('Delete this list'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Cannot delete'));

    api.deleteList.mockResolvedValueOnce({});
    api.listLists.mockResolvedValue([inbox]);
    await user.click(screen.getByText('Delete this list'));
    expect(api.deleteList).toHaveBeenLastCalledWith(2);
    await waitFor(() => expect(screen.queryByText('Delete this list')).not.toBeInTheDocument());
    await waitFor(() => expect(lastParams()).toMatchObject({ list: 1 }));
  });

  it('navigates to the edit page', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Todo 1');
    await user.click(within(screen.getByText('Todo 1').closest('li')).getByLabelText('Edit'));
    expect(screen.getByText('edit page')).toBeInTheDocument();
  });
});

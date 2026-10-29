import { get, post, put, del } from './client';

// Todos. params may hold list, done, q, tag, sort, page, limit.
export const listTodos = (params) => get('/todos', params);
export const getTodo = (id) => get(`/todos/${id}`);
export const createTodo = (todo) => post('/todos', todo);
export const updateTodo = (id, todo) => put(`/todos/${id}`, todo);
export const deleteTodo = (id) => del(`/todos/${id}`);
export const toggleTodo = (id) => post(`/todos/${id}/toggle`);
export const bulkTodos = (action, listId) =>
  post('/todos/bulk', { action, list_id: listId });

// Lists
export const listLists = () => get('/lists');
export const createList = (list) => post('/lists', list);
export const updateList = (id, list) => put(`/lists/${id}`, list);
export const deleteList = (id) => del(`/lists/${id}`);

// Users
export const loginUser = (username, password) =>
  post('/users/login', { username, password });
export const registerUser = (data) => post('/users/register', data);
export const logoutUser = () => post('/users/logout');
export const getMe = () => get('/users/me');
export const updateMe = (data) => put('/users/me', data);

// Stats
export const getStats = () => get('/stats');

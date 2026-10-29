import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { getTodo, listLists, updateTodo } from '../api/endpoints';
import { fromNow, priorityLabel } from '../lib/format';

export default function TodoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [todo, setTodo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listLists().then(
      (data) => {
        if (!cancelled) setLists(data || []);
      },
      () => {}
    );
    getTodo(id).then(
      (data) => {
        if (cancelled) return;
        setTodo({
          ...data,
          notes: data.notes || '',
          tagsText: (data.tags || []).join(', '),
          due_date: data.due_date ? moment(data.due_date).format('YYYY-MM-DD') : '',
        });
      },
      () => {
        if (!cancelled) navigate('/todos');
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (!todo) return null;

  const set = (key, value) => setTodo((t) => ({ ...t, [key]: value }));

  const save = (e) => {
    e.preventDefault();
    const data = {
      title: todo.title,
      notes: todo.notes,
      priority: parseInt(todo.priority, 10),
      list_id: todo.list_id,
      done: todo.done,
      due_date: todo.due_date ? moment(todo.due_date).format('YYYY-MM-DD') : null,
      tags: todo.tagsText ? todo.tagsText.split(',').map((t) => t.trim()) : [],
    };
    updateTodo(todo.id, data).then(
      () => navigate('/todos'),
      () => setError('Save failed')
    );
  };

  return (
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <h3>Edit todo</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={save}>
          <div className="form-group">
            <label htmlFor="todo-title">Title</label>
            <input
              id="todo-title"
              type="text"
              className="form-control"
              value={todo.title || ''}
              onChange={(e) => set('title', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="todo-notes">Notes</label>
            <textarea
              id="todo-notes"
              className="form-control"
              rows="4"
              value={todo.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
          <div className="row">
            <div className="col-sm-4 form-group">
              <label htmlFor="todo-list">List</label>
              <select
                id="todo-list"
                className="form-control"
                value={todo.list_id ?? ''}
                onChange={(e) => set('list_id', Number(e.target.value))}
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-4 form-group">
              <label htmlFor="todo-priority">Priority</label>
              <select
                id="todo-priority"
                className="form-control"
                value={todo.priority}
                onChange={(e) => set('priority', parseInt(e.target.value, 10))}
              >
                {[1, 2, 3].map((p) => (
                  <option key={p} value={p}>
                    {priorityLabel(p)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-4 form-group">
              <label htmlFor="todo-due">Due date</label>
              <input
                id="todo-due"
                type="date"
                className="form-control"
                value={todo.due_date}
                onChange={(e) => set('due_date', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="todo-tags">Tags (comma separated)</label>
            <input
              id="todo-tags"
              type="text"
              className="form-control"
              value={todo.tagsText}
              onChange={(e) => set('tagsText', e.target.value)}
            />
          </div>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={!!todo.done}
                onChange={(e) => set('done', e.target.checked)}
              />{' '}
              Completed
            </label>
          </div>
          <p className="text-muted small">
            Created {fromNow(todo.created_at)}, updated {fromNow(todo.updated_at)}
          </p>
          <button type="submit" className="btn btn-primary">
            Save
          </button>{' '}
          <button type="button" className="btn btn-default" onClick={() => navigate('/todos')}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

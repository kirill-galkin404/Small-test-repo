import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  bulkTodos,
  createList,
  createTodo,
  deleteList,
  deleteTodo,
  listLists,
  listTodos,
  toggleTodo,
} from '../api/endpoints';
import { prettyDate, priorityLabel } from '../lib/format';
import NewListModal from '../components/NewListModal';

const PAGE_SIZE = 20;
const EMPTY_FILTER = { done: '', q: '', tag: '', sort: '' };

function priorityClass(todo) {
  if (todo.priority == 3) return 'label-danger';
  if (todo.priority == 1) return 'label-default';
  return 'label-info';
}

export default function TodosPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [newTodo, setNewTodo] = useState({ title: '', priority: 2, due_date: '', tagsText: '' });
  const [modalOpen, setModalOpen] = useState(false);

  // Latest selection / filter / page, readable from async callbacks.
  const view = useRef({ selectedId: null, filter: EMPTY_FILTER, page: 1 });
  const loadSeq = useRef(0);

  const selectedList = lists.find((l) => l.id == selectedId) || null;

  const loadTodos = useCallback((patch) => {
    if (patch) {
      view.current = { ...view.current, ...patch };
      if ('selectedId' in patch) setSelectedId(patch.selectedId);
      if ('filter' in patch) setFilter(patch.filter);
      if ('page' in patch) setPage(patch.page);
    }
    const { selectedId: sel, filter: f, page: p } = view.current;
    const params = { page: p, limit: PAGE_SIZE };
    if (sel !== null && sel !== undefined) params.list = sel;
    if (f.done !== '') params.done = f.done;
    if (f.q) params.q = f.q;
    if (f.tag) params.tag = f.tag;
    if (f.sort) params.sort = f.sort;

    const seq = ++loadSeq.current;
    setLoading(true);
    listTodos(params).then(
      (data) => {
        if (seq !== loadSeq.current) return;
        setTodos(data || []);
        setLoading(false);
      },
      () => {
        if (seq !== loadSeq.current) return;
        setLoading(false);
        setGlobalError('Could not load todos');
      }
    );
  }, []);

  const loadLists = useCallback(() => {
    listLists().then(
      (data) => {
        setLists(data);
        if (view.current.selectedId === null && data.length) {
          loadTodos({ selectedId: data[0].id, page: 1 });
        }
      },
      () => setGlobalError('Could not load lists')
    );
  }, [loadTodos]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const selectList = (list) => loadTodos({ selectedId: list.id, page: 1 });
  const applyFilter = (patch) => loadTodos({ filter: { ...view.current.filter, ...patch }, page: 1 });
  // The search box edits the filter without reloading; later loads pick it up.
  const changeQuery = (q) => {
    view.current = { ...view.current, filter: { ...view.current.filter, q } };
    setFilter(view.current.filter);
  };
  const filterByTag = (tag) => applyFilter({ tag });
  const nextPage = () => {
    if (todos.length < PAGE_SIZE) return;
    loadTodos({ page: view.current.page + 1 });
  };
  const prevPage = () => {
    if (view.current.page > 1) loadTodos({ page: view.current.page - 1 });
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.title) return;
    const todo = {
      title: newTodo.title,
      priority: newTodo.priority,
      list_id: selectedList ? selectedList.id : null,
    };
    if (newTodo.tagsText) {
      todo.tags = newTodo.tagsText.split(',').map((t) => t.trim());
    }
    if (newTodo.due_date) {
      todo.due_date = moment(newTodo.due_date).format('YYYY-MM-DD');
    }
    createTodo(todo).then(
      (created) => {
        setTodos((prev) => [created, ...prev]);
        setNewTodo({ title: '', priority: 2, due_date: '', tagsText: '' });
        loadLists();
      },
      (err) => {
        window.alert('Error: ' + (err.data && err.data.error));
      }
    );
  };

  const setDone = (id, done) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));

  const toggle = (todo) => {
    const next = !todo.done;
    setDone(todo.id, next);
    toggleTodo(todo.id).then(
      () => loadLists(),
      () => setDone(todo.id, !next)
    );
  };

  const remove = (todo) => {
    if (!window.confirm('Delete "' + todo.title + '"?')) return;
    deleteTodo(todo.id).then(() => {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      loadLists();
    });
  };

  const completeAll = () => {
    bulkTodos('complete_all', selectedList.id).then(() => {
      loadTodos();
      loadLists();
    });
  };

  const clearDone = () => {
    if (!window.confirm('Delete all completed todos in this list?')) return;
    bulkTodos('clear_done', selectedList.id).then(() => {
      loadTodos();
      loadLists();
    });
  };

  const handleCreateList = (data) => {
    createList(data).then((created) => {
      setModalOpen(false);
      setLists((prev) => [...prev, created]);
      selectList(created);
    });
  };

  const handleDeleteList = (list) => {
    if (!window.confirm('Delete list "' + list.name + '" and all its todos?')) return;
    deleteList(list.id).then(
      () => {
        view.current = { ...view.current, selectedId: null };
        setSelectedId(null);
        loadLists();
      },
      (err) => {
        window.alert((err.data && err.data.error) || err.message);
      }
    );
  };

  return (
    <div>
      {globalError && <div className="alert alert-danger">{globalError}</div>}
      <div className="row">
        {/* sidebar with lists */}
        <div className="col-md-3">
          <div className="list-group">
            {lists.map((list) => (
              <a
                key={list.id}
                href="#"
                className={'list-group-item' + (selectedId == list.id ? ' active' : '')}
                onClick={(e) => {
                  e.preventDefault();
                  selectList(list);
                }}
              >
                <span className="list-color" style={{ backgroundColor: list.color }}></span>{' '}
                {list.name} <span className="badge">{list.total - list.done}</span>
              </a>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-default btn-sm btn-block"
            onClick={() => setModalOpen(true)}
          >
            <span className="glyphicon glyphicon-plus"></span> New list
          </button>
          {selectedList && selectedList.name !== 'Inbox' && (
            <button
              type="button"
              className="btn btn-link btn-sm btn-block text-danger"
              onClick={() => handleDeleteList(selectedList)}
            >
              Delete this list
            </button>
          )}
        </div>

        <div className="col-md-9">
          <h3>
            {selectedList && selectedList.name}{' '}
            {selectedList && (
              <small>
                {selectedList.done} / {selectedList.total} done
              </small>
            )}
          </h3>

          {/* add form */}
          <form className="well well-sm add-form" onSubmit={addTodo}>
            <div className="row">
              <div className="col-sm-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="What needs to be done?"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
              </div>
              <div className="col-sm-2">
                <select
                  className="form-control"
                  aria-label="Priority"
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: parseInt(e.target.value, 10) })}
                >
                  {[1, 2, 3].map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-sm-2">
                <input
                  type="date"
                  className="form-control"
                  aria-label="Due date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                />
              </div>
              <div className="col-sm-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="tags"
                  value={newTodo.tagsText}
                  onChange={(e) => setNewTodo({ ...newTodo, tagsText: e.target.value })}
                />
              </div>
              <div className="col-sm-1">
                <button type="submit" className="btn btn-primary">
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* filters */}
          <form
            className="form-inline filters"
            onSubmit={(e) => {
              e.preventDefault();
              applyFilter({});
            }}
          >
            <input
              type="text"
              className="form-control input-sm"
              placeholder="Search..."
              value={filter.q}
              onChange={(e) => changeQuery(e.target.value)}
            />{' '}
            <select
              className="form-control input-sm"
              aria-label="Done filter"
              value={filter.done}
              onChange={(e) => applyFilter({ done: e.target.value })}
            >
              <option value="">All</option>
              <option value="0">Active</option>
              <option value="1">Completed</option>
            </select>{' '}
            <select
              className="form-control input-sm"
              aria-label="Sort"
              value={filter.sort}
              onChange={(e) => applyFilter({ sort: e.target.value })}
            >
              <option value="">Newest</option>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
            </select>{' '}
            {filter.tag && (
              <span className="label label-primary">
                #{filter.tag}{' '}
                <a
                  href="#"
                  className="tag-clear"
                  aria-label="Clear tag"
                  onClick={(e) => {
                    e.preventDefault();
                    filterByTag('');
                  }}
                >
                  &times;
                </a>
              </span>
            )}{' '}
            <button type="submit" className="btn btn-default btn-sm">
              Search
            </button>
            <div className="pull-right">
              <button
                type="button"
                className="btn btn-default btn-sm"
                disabled={!selectedList}
                onClick={completeAll}
              >
                Complete all
              </button>{' '}
              <button
                type="button"
                className="btn btn-default btn-sm"
                disabled={!selectedList}
                onClick={clearDone}
              >
                Clear completed
              </button>
            </div>
          </form>

          {loading && <div className="text-muted">Loading...</div>}

          <ul className="list-group todo-list">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={
                  'list-group-item' +
                  (todo.done ? ' todo-done' : '') +
                  (todo.overdue ? ' todo-overdue' : '')
                }
              >
                <input type="checkbox" checked={!!todo.done} onChange={() => toggle(todo)} />{' '}
                <span className="todo-title" onDoubleClick={() => navigate('/todos/' + todo.id)}>
                  {todo.title}
                </span>{' '}
                <span className={'label ' + priorityClass(todo)}>{priorityLabel(todo.priority)}</span>{' '}
                {(todo.tags || []).map((tag) => (
                  <React.Fragment key={tag}>
                    <a
                      href="#"
                      className="tag"
                      onClick={(e) => {
                        e.preventDefault();
                        filterByTag(tag);
                      }}
                    >
                      #{tag}
                    </a>{' '}
                  </React.Fragment>
                ))}
                {todo.due_date && (
                  <span className="text-muted small">
                    due {prettyDate(todo.due_date)}
                    {todo.overdue && <span className="text-danger"> (overdue)</span>}
                  </span>
                )}
                <div className="pull-right">
                  <a
                    href="#"
                    aria-label="Edit"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/todos/' + todo.id);
                    }}
                  >
                    <span className="glyphicon glyphicon-pencil"></span>
                  </a>{' '}
                  <a
                    href="#"
                    aria-label="Delete"
                    className="text-danger"
                    onClick={(e) => {
                      e.preventDefault();
                      remove(todo);
                    }}
                  >
                    <span className="glyphicon glyphicon-trash"></span>
                  </a>
                </div>
                {todo.notes && <div className="todo-notes text-muted small">{todo.notes}</div>}
              </li>
            ))}
            {!loading && todos.length === 0 && (
              <li className="list-group-item text-muted">Nothing here.</li>
            )}
          </ul>

          <ul className="pager">
            <li className={'previous' + (page === 1 ? ' disabled' : '')}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  prevPage();
                }}
              >
                &larr; Prev
              </a>
            </li>
            <li>
              <span>Page {page}</span>
            </li>
            <li className={'next' + (todos.length < PAGE_SIZE ? ' disabled' : '')}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  nextPage();
                }}
              >
                Next &rarr;
              </a>
            </li>
          </ul>
        </div>
      </div>

      {modalOpen && <NewListModal onClose={() => setModalOpen(false)} onCreate={handleCreateList} />}
    </div>
  );
}

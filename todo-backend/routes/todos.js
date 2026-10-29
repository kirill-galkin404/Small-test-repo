var express = require('express');
var moment = require('moment');
var _ = require('lodash');
var query = require('../lib/query');
var requireUser = require('../middleware/requireUser');
var config = require('../config');

var router = express.Router();

router.use(requireUser);

function formatTodo(t) {
  t.done = t.done == 1;
  t.tags = t.tags ? t.tags.split(',') : [];
  t.overdue = !t.done && t.due_date && moment(t.due_date).isBefore(moment(), 'day');
  return t;
}

// async handlers report failures to the express error handler
function wrap(handler) {
  return function (req, res, next) {
    handler(req, res, next).catch(next);
  };
}

// GET /todos?list=1&done=0&q=milk&tag=home&sort=due&page=1
router.get('/', wrap(async function (req, res) {
  var sql = 'SELECT * FROM todos WHERE user_id = ?';
  var params = [req.user.id];
  if (req.query.list) {
    sql += ' AND list_id = ?';
    params.push(String(req.query.list));
  }
  if (req.query.done === '0' || req.query.done === '1') {
    sql += ' AND done = ?';
    params.push(Number(req.query.done));
  }
  if (req.query.q) {
    var like = ['%', String(req.query.q), '%'].join('');
    sql += ' AND (title LIKE ? OR notes LIKE ?)';
    params.push(like, like);
  }
  if (req.query.tag) {
    sql += ' AND tags LIKE ?';
    params.push(['%', String(req.query.tag), '%'].join(''));
  }
  if (req.query.sort == 'due') {
    sql += ' ORDER BY due_date IS NULL, due_date ASC';
  } else if (req.query.sort == 'priority') {
    sql += ' ORDER BY priority DESC';
  } else {
    sql += ' ORDER BY id DESC';
  }
  var page = parseInt(req.query.page, 10) || 1;
  sql += ' LIMIT ? OFFSET ?';
  params.push(config.pageSize, (page - 1) * config.pageSize);

  var rows = await query.all(sql, params);
  res.send(_.map(rows, formatTodo));
}));

router.get('/:id', wrap(async function (req, res) {
  var row = await query.get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!row) return res.status(404).send({ error: 'not found' });
  res.send(formatTodo(row));
}));

router.post('/', wrap(async function (req, res) {
  var b = req.body;
  if (!b.title || b.title.trim() == '') {
    return res.status(400).send({ error: 'title required' });
  }
  var tags = _.isArray(b.tags) ? b.tags.join(',') : (b.tags || '');
  var now = moment().format();

  var listId = b.list_id;
  if (!listId) {
    // put into Inbox
    var inbox = await query.get("SELECT id FROM lists WHERE user_id = ? AND name = 'Inbox'", [req.user.id]);
    listId = inbox ? inbox.id : null;
  }

  var inserted = await query.run('INSERT INTO todos (user_id, list_id, title, notes, done, priority, due_date, tags, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [req.user.id, listId, b.title, b.notes || '', 0, b.priority || 2, b.due_date || null, tags, now, now]);
  var row = await query.get('SELECT * FROM todos WHERE id = ?', [inserted.lastID]);
  res.status(201).send(formatTodo(row));
}));

router.put('/:id', wrap(async function (req, res) {
  var todo = await query.get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!todo) return res.status(404).send({ error: 'not found' });

  var b = req.body;
  var updated = {
    title: b.title !== undefined ? b.title : todo.title,
    notes: b.notes !== undefined ? b.notes : todo.notes,
    done: b.done !== undefined ? (b.done ? 1 : 0) : todo.done,
    priority: b.priority !== undefined ? b.priority : todo.priority,
    due_date: b.due_date !== undefined ? b.due_date : todo.due_date,
    list_id: b.list_id !== undefined ? b.list_id : todo.list_id,
    tags: b.tags !== undefined ? (_.isArray(b.tags) ? b.tags.join(',') : b.tags) : todo.tags
  };

  await query.run('UPDATE todos SET title=?, notes=?, done=?, priority=?, due_date=?, list_id=?, tags=?, updated_at=? WHERE id=?',
    [updated.title, updated.notes, updated.done, updated.priority, updated.due_date, updated.list_id, updated.tags, moment().format(), todo.id]);
  var row = await query.get('SELECT * FROM todos WHERE id = ?', [todo.id]);
  res.send(formatTodo(row));
}));

router.post('/:id/toggle', wrap(async function (req, res) {
  await query.run('UPDATE todos SET done = 1 - done, updated_at = ? WHERE id = ?', [moment().format(), req.params.id]);
  res.send({ ok: true });
}));

router.delete('/:id', wrap(async function (req, res) {
  var result = await query.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (result.changes == 0) return res.status(404).send({ error: 'not found' });
  res.send({ ok: true });
}));

// bulk: mark all done / delete done in a list
router.post('/bulk', wrap(async function (req, res) {
  var action = req.body.action;
  var listId = req.body.list_id;
  if (action == 'complete_all') {
    var done = await query.run('UPDATE todos SET done = 1 WHERE user_id = ? AND list_id = ?', [req.user.id, listId]);
    res.send({ ok: true, changed: done.changes });
  } else if (action == 'clear_done') {
    var cleared = await query.run('DELETE FROM todos WHERE user_id = ? AND list_id = ? AND done = 1', [req.user.id, listId]);
    res.send({ ok: true, changed: cleared.changes });
  } else {
    res.status(400).send('unknown action');
  }
}));

module.exports = router;

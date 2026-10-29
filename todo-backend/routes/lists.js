var express = require('express');
var moment = require('moment');
var query = require('../lib/query');
var requireUser = require('../middleware/requireUser');

var router = express.Router();

router.use(requireUser);

// async handlers report failures to the express error handler
function wrap(handler) {
  return function (req, res, next) {
    handler(req, res, next).catch(next);
  };
}

// GET /lists - lists with todo counts
router.get('/', wrap(async function (req, res) {
  var lists = await query.all('SELECT * FROM lists WHERE user_id = ? ORDER BY id', [req.user.id]);
  // N+1, fine for now
  var result = await Promise.all(lists.map(async function (list) {
    var row = await query.get('SELECT COUNT(*) as total, SUM(done) as done FROM todos WHERE list_id = ?', [list.id]);
    list.total = row.total;
    list.done = row.done || 0;
    return list;
  }));
  res.send(result);
}));

router.post('/', wrap(async function (req, res) {
  if (!req.body.name) return res.status(400).send({ error: 'name required' });
  var inserted = await query.run('INSERT INTO lists (user_id, name, color, created_at) VALUES (?, ?, ?, ?)',
    [req.user.id, req.body.name, req.body.color || '#337ab7', moment().format()]);
  var list = await query.get('SELECT * FROM lists WHERE id = ?', [inserted.lastID]);
  res.send(list);
}));

router.put('/:id', wrap(async function (req, res) {
  await query.run('UPDATE lists SET name = ?, color = ? WHERE id = ? AND user_id = ?',
    [req.body.name, req.body.color, req.params.id, req.user.id]);
  res.send({ ok: true });
}));

// deleting a list deletes its todos too, atomically
router.delete('/:id', wrap(async function (req, res) {
  var list = await query.get('SELECT * FROM lists WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!list) return res.status(404).send({ error: 'not found' });
  if (list.name == 'Inbox') return res.status(400).send({ error: 'cannot delete Inbox' });
  await query.withTransaction(async function (tx) {
    await tx.run('DELETE FROM todos WHERE list_id = ? AND user_id = ?', [list.id, req.user.id]);
    await tx.run('DELETE FROM lists WHERE id = ? AND user_id = ?', [list.id, req.user.id]);
  });
  res.send({ ok: true });
}));

module.exports = router;

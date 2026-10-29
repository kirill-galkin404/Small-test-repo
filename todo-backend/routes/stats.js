var express = require('express');
var moment = require('moment');
var _ = require('lodash');
var query = require('../lib/query');
var requireUser = require('../middleware/requireUser');

var router = express.Router();

function count(sql, params) {
  return query.get(sql, params).then(function (r) { return r && r.c; });
}

router.get('/', requireUser, function (req, res, next) {
  var userId = req.user.id;
  var today = moment().format('YYYY-MM-DD');

  Promise.all([
    count('SELECT COUNT(*) as c FROM todos WHERE user_id = ?', [userId]),
    count('SELECT COUNT(*) as c FROM todos WHERE user_id = ? AND done = 1', [userId]),
    count('SELECT COUNT(*) as c FROM todos WHERE user_id = ? AND done = 0 AND due_date < ?', [userId, today]),
    count('SELECT COUNT(*) as c FROM todos WHERE user_id = ? AND done = 0 AND substr(due_date, 1, 10) = ?', [userId, today]),
    // tags are stored comma separated, so count them in JS
    query.all('SELECT tags FROM todos WHERE user_id = ?', [userId]).then(function (rows) {
      var all = _.flatten(_.map(rows, function (r) { return r.tags ? r.tags.split(',') : []; }));
      return _.countBy(_.compact(_.map(all, _.trim)));
    })
  ]).then(function (r) {
    var result = { total: r[0], done: r[1], overdue: r[2], dueToday: r[3], tags: r[4] };
    result.percentDone = result.total ? Math.round(result.done / result.total * 100) : 0;
    res.send(result);
  }).catch(next);
});

module.exports = router;

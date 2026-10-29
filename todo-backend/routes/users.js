var express = require('express');
var moment = require('moment');
var query = require('../lib/query');
var passwords = require('../lib/passwords');
var tokens = require('../lib/tokens');
var requireUser = require('../middleware/requireUser');
var config = require('../config');

var router = express.Router();

function wrap(handler) {
  return function (req, res) {
    handler(req, res).catch(function (err) {
      console.log(err);
      if (!res.headersSent) res.status(500).send({ error: 'server error' });
    });
  };
}

async function issueToken(userId) {
  var token = tokens.makeToken();
  await query.run('INSERT INTO tokens (token, user_id, expires) VALUES (?, ?, ?)',
    [token, userId, moment().add(config.tokenTtlHours, 'hours').format()]);
  return token;
}

router.post('/register', wrap(async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  if (!username || !password) {
    return res.status(400).send({ error: 'username and password required' });
  }

  var hash = await passwords.hashPassword(password);
  // check and insert in one transaction so concurrent registrations cannot both pass
  var userId = await query.withTransaction(async function (tx) {
    var existing = await tx.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return null;
    var inserted = await tx.run('INSERT INTO users (username, password, email, created_at) VALUES (?, ?, ?, ?)',
      [username, hash, email, moment().format()]);
    return inserted.lastID;
  });
  if (userId === null) return res.status(409).send({ error: 'user exists' });

  // create default list for new user
  try {
    await query.run('INSERT INTO lists (user_id, name, color, created_at) VALUES (?, ?, ?, ?)',
      [userId, 'Inbox', '#999999', moment().format()]);
  } catch (err) {
    console.log('could not create inbox', err);
  }

  var token = await issueToken(userId);
  res.send({ token: token, user: { id: userId, username: username, email: email } });
}));

router.post('/login', wrap(async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  var user = (username === undefined || username === null || password === undefined || password === null) ?
    null : await query.get('SELECT * FROM users WHERE username = ?', [username]);
  var check = user ? await passwords.verifyPassword(password, user.password) : { ok: false };
  if (!check.ok) return res.status(401).send({ error: 'wrong username or password' });

  if (check.rehash) {
    await query.run('UPDATE users SET password = ? WHERE id = ?',
      [await passwords.hashPassword(password), user.id]);
  }

  var token = await issueToken(user.id);
  delete user.password;
  res.send({ token: token, user: user });
}));

router.post('/logout', requireUser, wrap(async function (req, res) {
  var token = req.headers['x-auth-token'] || req.query.token;
  try {
    await query.run('DELETE FROM tokens WHERE token = ?', [String(token)]);
  } catch (err) {
    console.log(err);
  }
  res.send({ ok: true });
}));

router.get('/me', requireUser, function (req, res) {
  var u = req.user;
  res.send({ id: u.id, username: u.username, email: u.email, created_at: u.created_at });
});

router.put('/me', requireUser, wrap(async function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (password) {
    await query.run('UPDATE users SET email = ?, password = ? WHERE id = ?',
      [email, await passwords.hashPassword(password), req.user.id]);
  } else {
    await query.run('UPDATE users SET email = ? WHERE id = ?', [email, req.user.id]);
  }
  res.send({ ok: true });
}));

module.exports = router;

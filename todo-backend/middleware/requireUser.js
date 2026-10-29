var moment = require('moment');
var query = require('../lib/query');

// express middleware: x-auth-token header or ?token= query parameter
async function requireUser(req, res, next) {
  var token = req.headers['x-auth-token'] || req.query.token;
  if (!token) {
    return res.status(401).send({ error: 'no token' });
  }
  var row;
  try {
    row = await query.get('SELECT * FROM tokens WHERE token = ?', [String(token)]);
  } catch (err) {
    console.log(err);
    return res.status(500).send('db error');
  }
  if (!row) {
    return res.status(401).send({ error: 'bad token' });
  }
  if (moment(row.expires).isBefore(moment())) {
    return res.status(401).json({ message: 'token expired' });
  }
  var user;
  try {
    user = await query.get('SELECT * FROM users WHERE id = ?', [row.user_id]);
  } catch (err) {
    user = null;
  }
  if (!user) {
    return res.status(401).send({ error: 'user not found' });
  }
  req.user = user;
  next();
}

module.exports = requireUser;

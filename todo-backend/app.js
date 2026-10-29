var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config');

var app = express();

// ?token= is accepted for auth, so keep it out of the request log
morgan.token('safe-url', function (req) {
  return String(req.originalUrl || req.url).replace(/([?&]token=)[^&]*/gi, '$1[redacted]');
});
app.use(morgan(':method :safe-url :status :response-time ms - :res[content-length]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', config.allowOrigin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/', function (req, res) {
  res.send('todo api is running');
});

app.use('/api/users', require('./routes/users'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/todos', require('./routes/todos'));
app.use('/api/stats', require('./routes/stats'));

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

module.exports = app;

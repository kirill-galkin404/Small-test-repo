var app = require('./app');
var config = require('./config');

if (!process.env.SECRET) {
  console.warn('WARNING: SECRET is not set; using the built-in default. Set SECRET before deploying.');
}

app.listen(config.port, function () {
  console.log('Todo API listening on port ' + config.port);
});

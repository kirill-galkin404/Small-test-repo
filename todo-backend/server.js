var app = require('./app');
var config = require('./config');

app.listen(config.port, function () {
  console.log('Todo API listening on port ' + config.port);
});

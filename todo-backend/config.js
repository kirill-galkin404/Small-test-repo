// TODO move to env vars
module.exports = {
  port: 3000,
  dbFile: process.env.DB_FILE || __dirname + '/todo.db',
  secret: 'supersecret123',
  tokenTtlHours: 24,
  allowOrigin: '*',
  pageSize: 20
};

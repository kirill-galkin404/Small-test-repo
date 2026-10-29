function intFromEnv(name, fallback) {
  var n = parseInt(process.env[name], 10);
  return isNaN(n) ? fallback : n;
}

function strFromEnv(name, fallback) {
  var v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

module.exports = {
  port: intFromEnv('PORT', 3000),
  dbFile: strFromEnv('DB_FILE', __dirname + '/todo.db'),
  secret: strFromEnv('SECRET', 'supersecret123'),
  tokenTtlHours: intFromEnv('TOKEN_TTL_HOURS', 24),
  allowOrigin: strFromEnv('ALLOW_ORIGIN', '*'),
  pageSize: intFromEnv('PAGE_SIZE', 20)
};

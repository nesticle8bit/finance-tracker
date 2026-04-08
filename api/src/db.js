const { Pool, types } = require('pg');

// Parse NUMERIC as float instead of string
types.setTypeParser(1700, (val) => parseFloat(val));

// Parse .NET-style connection string: Host=...;Port=...;Database=...;Username=...;Password=...
function parseConnString(str) {
  if (!str || str.startsWith('postgres')) return { connectionString: str };
  const map = {};
  str.split(';').forEach(part => {
    const [k, ...v] = part.split('=');
    if (k) map[k.trim().toLowerCase()] = v.join('=').trim();
  });
  return {
    host: map['host'],
    port: parseInt(map['port'] || '5432'),
    database: map['database'],
    user: map['username'] || map['user id'] || map['user'],
    password: map['password'],
    ssl: map['sslmode'] === 'require' ? { rejectUnauthorized: false } : false,
  };
}

const pool = new Pool(parseConnString(process.env.DB_CONNECTION_STRING));

pool.on('error', (err) => console.error('DB pool error:', err));

module.exports = pool;

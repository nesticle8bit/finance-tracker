const jwt = require('jsonwebtoken');
const { fail } = require('../response');

function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) return fail(res, 'Unauthorized', 401);
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    fail(res, 'Invalid or expired token', 401);
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return fail(res, 'Forbidden', 403);
  next();
}

module.exports = { auth, adminOnly };

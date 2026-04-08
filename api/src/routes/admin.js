const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth, adminOnly } = require('../middleware/auth');
const { seedUserCategories } = require('../seed');

router.use(auth, adminOnly);

const USER_COLS = `"Id","Email","Name","Role","CreatedAt","LastSeenAt"`;

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${USER_COLS} FROM authentications.users ORDER BY "Name"`
    );
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const { rows, rowCount } = await pool.query(
      `SELECT ${USER_COLS} FROM authentications.users WHERE "Id"=$1`, [req.params.id]
    );
    if (rowCount === 0) return fail(res, 'User not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/admin/users
router.post('/users', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return fail(res, 'name, email and password are required');

  const normalEmail = email.trim().toLowerCase();
  try {
    const existing = await pool.query(
      `SELECT "Id" FROM authentications.users WHERE "Email"=$1`, [normalEmail]
    );
    if (existing.rowCount > 0) return fail(res, 'User with the same email already exists');

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO authentications.users ("Email","Name","PasswordHash","Role")
       VALUES ($1,$2,$3,$4) RETURNING ${USER_COLS}`,
      [normalEmail, name.trim(), hash, role || 'user']
    );
    await seedUserCategories(rows[0].Id);
    return ok(res, rows[0], 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return fail(res, 'name and email are required');

  const normalEmail = email.trim().toLowerCase();
  try {
    const taken = await pool.query(
      `SELECT "Id" FROM authentications.users WHERE "Email"=$1 AND "Id"!=$2`,
      [normalEmail, req.params.id]
    );
    if (taken.rowCount > 0) return fail(res, 'Email already in use');

    const { rows, rowCount } = await pool.query(
      `UPDATE authentications.users SET "Name"=$1,"Email"=$2,"Role"=$3 WHERE "Id"=$4
       RETURNING ${USER_COLS}`,
      [name.trim(), normalEmail, role || 'user', req.params.id]
    );
    if (rowCount === 0) return fail(res, 'User not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM authentications.users WHERE "Id"=$1`, [req.params.id]
    );
    if (rowCount === 0) return fail(res, 'User not found', 404);
    return ok(res, null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

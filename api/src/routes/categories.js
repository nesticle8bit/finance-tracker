const router = require('express').Router();
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "Id","Name","Icon","Color","Type","IsDefault"
       FROM parameters.categories WHERE "UserId"=$1 ORDER BY "Name"`,
      [req.user.id]
    );
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  const { name, icon, color, type } = req.body;
  if (!name || !type) return fail(res, 'name and type are required');

  try {
    const { rows } = await pool.query(
      `INSERT INTO parameters.categories ("UserId","Name","Icon","Color","Type","IsDefault")
       VALUES ($1,$2,$3,$4,$5,false) RETURNING *`,
      [req.user.id, name, icon || '', color || '', type]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  const { name, icon, color, type } = req.body;
  if (!name || !type) return fail(res, 'name and type are required');

  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE parameters.categories SET "Name"=$1,"Icon"=$2,"Color"=$3,"Type"=$4
       WHERE "Id"=$5 AND "UserId"=$6 RETURNING *`,
      [name, icon || '', color || '', type, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Category not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows, rowCount } = await pool.query(
      `SELECT "IsDefault" FROM parameters.categories WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Category not found', 404);
    if (rows[0].IsDefault) return fail(res, 'Default categories cannot be deleted');

    await pool.query(
      `DELETE FROM parameters.categories WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    return ok(res, null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

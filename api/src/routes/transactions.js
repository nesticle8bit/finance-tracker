const router = require('express').Router();
const { randomUUID } = require('crypto');
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/transactions?month=YYYY-MM
router.get('/', async (req, res) => {
  const { month } = req.query;
  try {
    let query = `
      SELECT t."Id", t."CategoryId", t."Desc", t."Amount", t."Type", t."Date", t."CreatedAt"
      FROM finance.transactions t
      WHERE t."UserId" = $1
    `;
    const params = [req.user.id];

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query += ` AND TO_CHAR(t."Date", 'YYYY-MM') = $2`;
      params.push(month);
    }
    query += ` ORDER BY t."Date" DESC, t."CreatedAt" DESC`;

    const { rows } = await pool.query(query, params);
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  const { categoryId, desc, amount, type, date } = req.body;
  if (!categoryId || amount == null || !type || !date) return fail(res, 'categoryId, amount, type and date are required');

  try {
    const { rows } = await pool.query(
      `INSERT INTO finance.transactions ("Id","UserId","CategoryId","Desc","Amount","Type","Date","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
      [randomUUID(), req.user.id, categoryId, desc || '', amount, type, date]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  const { categoryId, desc, amount, type, date } = req.body;
  if (!categoryId || amount == null || !type || !date) return fail(res, 'categoryId, amount, type and date are required');

  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance.transactions
       SET "CategoryId"=$1,"Desc"=$2,"Amount"=$3,"Type"=$4,"Date"=$5
       WHERE "Id"=$6 AND "UserId"=$7 RETURNING *`,
      [categoryId, desc || '', amount, type, date, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Transaction not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM finance.transactions WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Transaction not found', 404);
    return ok(res, null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

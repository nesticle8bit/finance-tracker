const router = require('express').Router();
const { randomUUID } = require('crypto');
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM finance."savingsGoals" WHERE "UserId"=$1 ORDER BY "CreatedAt" DESC`,
      [req.user.id]
    );
    return ok(res, rows);
  } catch (e) { return fail(res, e.message, 500); }
});

router.post('/', async (req, res) => {
  const { name, icon, color, targetAmount, targetDate } = req.body;
  if (!name || !targetAmount) return fail(res, 'name and targetAmount required');
  try {
    const { rows } = await pool.query(
      `INSERT INTO finance."savingsGoals"
        ("Id","UserId","Name","Icon","Color","TargetAmount","TargetDate","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
      [randomUUID(), req.user.id, name, icon || 'savings', color || '#14b8a6', targetAmount, targetDate || null]
    );
    return ok(res, rows[0], 201);
  } catch (e) { return fail(res, e.message, 500); }
});

router.put('/:id', async (req, res) => {
  const { name, icon, color, targetAmount, targetDate } = req.body;
  if (!name || !targetAmount) return fail(res, 'name and targetAmount required');
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance."savingsGoals"
       SET "Name"=$1,"Icon"=$2,"Color"=$3,"TargetAmount"=$4,"TargetDate"=$5
       WHERE "Id"=$6 AND "UserId"=$7 RETURNING *`,
      [name, icon || 'savings', color || '#14b8a6', targetAmount, targetDate || null, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, rows[0]);
  } catch (e) { return fail(res, e.message, 500); }
});

// POST /api/savings-goals/:id/contribute — add amount to current
router.post('/:id/contribute', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return fail(res, 'amount required');
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance."savingsGoals"
       SET "CurrentAmount" = LEAST("CurrentAmount" + $1, "TargetAmount")
       WHERE "Id"=$2 AND "UserId"=$3 RETURNING *`,
      [amount, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, rows[0]);
  } catch (e) { return fail(res, e.message, 500); }
});

// POST /api/savings-goals/:id/withdraw — subtract amount
router.post('/:id/withdraw', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return fail(res, 'amount required');
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance."savingsGoals"
       SET "CurrentAmount" = GREATEST("CurrentAmount" - $1, 0)
       WHERE "Id"=$2 AND "UserId"=$3 RETURNING *`,
      [amount, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, rows[0]);
  } catch (e) { return fail(res, e.message, 500); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM finance."savingsGoals" WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, null);
  } catch (e) { return fail(res, e.message, 500); }
});

module.exports = router;

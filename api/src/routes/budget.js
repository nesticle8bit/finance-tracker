const router = require('express').Router();
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "Budget" FROM finance."budgetConfig" WHERE "UserId"=$1`,
      [req.user.id]
    );
    return ok(res, { amount: rows[0]?.Budget ?? 0 });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/budget
router.put('/', async (req, res) => {
  const { amount } = req.body;
  if (amount == null) return fail(res, 'amount is required');

  try {
    await pool.query(
      `INSERT INTO finance."budgetConfig" ("UserId","Budget") VALUES ($1,$2)
       ON CONFLICT ("UserId") DO UPDATE SET "Budget"=$2`,
      [req.user.id, amount]
    );
    return ok(res, { amount });
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/budget/limits
router.get('/limits', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "Id","CategoryId","Limit" FROM finance."categoryLimit" WHERE "UserId"=$1`,
      [req.user.id]
    );
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/budget/limits/:categoryId
router.put('/limits/:categoryId', async (req, res) => {
  const { limit } = req.body;
  if (limit == null) return fail(res, 'limit is required');

  try {
    const { rows } = await pool.query(
      `INSERT INTO finance."categoryLimit" ("UserId","CategoryId","Limit") VALUES ($1,$2,$3)
       ON CONFLICT ("UserId","CategoryId") DO UPDATE SET "Limit"=$3
       RETURNING *`,
      [req.user.id, req.params.categoryId, limit]
    );
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

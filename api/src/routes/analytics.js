const router = require('express').Router();
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/analytics/trends?months=6
router.get('/trends', async (req, res) => {
  const months = Math.min(parseInt(req.query.months) || 6, 24);
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR("Date", 'YYYY-MM') AS month,
        SUM(CASE WHEN "Type" = 'income'  THEN "Amount" ELSE 0 END) AS income,
        SUM(CASE WHEN "Type" = 'expense' THEN "Amount" ELSE 0 END) AS expense
      FROM finance.transactions
      WHERE "UserId" = $1
        AND "Date" >= DATE_TRUNC('month', NOW()) - INTERVAL '${months - 1} months'
      GROUP BY month
      ORDER BY month ASC
    `, [req.user.id]);
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/analytics/compare?m1=YYYY-MM&m2=YYYY-MM
router.get('/compare', async (req, res) => {
  const { m1, m2 } = req.query;
  if (!m1 || !m2) return fail(res, 'm1 and m2 required');
  try {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR("Date", 'YYYY-MM') AS month,
        SUM(CASE WHEN "Type" = 'income'  THEN "Amount" ELSE 0 END) AS income,
        SUM(CASE WHEN "Type" = 'expense' THEN "Amount" ELSE 0 END) AS expense,
        t."CategoryId" AS "categoryId"
      FROM finance.transactions t
      WHERE t."UserId" = $1
        AND TO_CHAR(t."Date", 'YYYY-MM') IN ($2, $3)
      GROUP BY month, t."CategoryId"
      ORDER BY month, expense DESC
    `, [req.user.id, m1, m2]);
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

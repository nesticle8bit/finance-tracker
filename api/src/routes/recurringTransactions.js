const router = require('express').Router();
const { randomUUID } = require('crypto');
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/recurring-transactions?month=YYYY-MM — templates + applied status for month
router.get('/', async (req, res) => {
  const month = req.query.month || (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();
  try {
    const { rows } = await pool.query(`
      SELECT rt.*,
        log."Id"            AS "logId",
        log."TransactionId" AS "appliedTransactionId",
        log."AppliedAt"     AS "appliedAt"
      FROM finance."recurringTransactions" rt
      LEFT JOIN finance."recurringTransactionLogs" log
        ON log."RecurringId" = rt."Id" AND log."Month" = $2
      WHERE rt."UserId" = $1
      ORDER BY rt."DayOfMonth", rt."CreatedAt"
    `, [req.user.id, month]);
    return ok(res, rows);
  } catch (e) { return fail(res, e.message, 500); }
});

router.post('/', async (req, res) => {
  const { categoryId, desc, amount, type, dayOfMonth } = req.body;
  if (!categoryId || !amount || !type) return fail(res, 'categoryId, amount, type required');
  try {
    const { rows } = await pool.query(
      `INSERT INTO finance."recurringTransactions"
        ("Id","UserId","CategoryId","Desc","Amount","Type","DayOfMonth","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
      [randomUUID(), req.user.id, categoryId, desc || '', amount, type, dayOfMonth || 1]
    );
    return ok(res, rows[0], 201);
  } catch (e) { return fail(res, e.message, 500); }
});

router.put('/:id', async (req, res) => {
  const { categoryId, desc, amount, type, dayOfMonth, active } = req.body;
  if (!categoryId || !amount || !type) return fail(res, 'categoryId, amount, type required');
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance."recurringTransactions"
       SET "CategoryId"=$1,"Desc"=$2,"Amount"=$3,"Type"=$4,"DayOfMonth"=$5,"Active"=$6
       WHERE "Id"=$7 AND "UserId"=$8 RETURNING *`,
      [categoryId, desc || '', amount, type, dayOfMonth || 1, active !== false, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, rows[0]);
  } catch (e) { return fail(res, e.message, 500); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM finance."recurringTransactions" WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, null);
  } catch (e) { return fail(res, e.message, 500); }
});

// POST /api/recurring-transactions/:id/apply — create real transaction for month
router.post('/:id/apply', async (req, res) => {
  const { month, date } = req.body;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return fail(res, 'month (YYYY-MM) required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check not already applied
    const exists = await client.query(
      `SELECT "Id" FROM finance."recurringTransactionLogs" WHERE "RecurringId"=$1 AND "Month"=$2`,
      [req.params.id, month]
    );
    if (exists.rowCount > 0) { await client.query('ROLLBACK'); return fail(res, 'Ya aplicado este mes', 409); }

    // Get template
    const tmpl = await client.query(
      `SELECT * FROM finance."recurringTransactions" WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (tmpl.rowCount === 0) { await client.query('ROLLBACK'); return fail(res, 'Not found', 404); }
    const t = tmpl.rows[0];

    // Create transaction
    const txDate = date || `${month}-${String(t.DayOfMonth).padStart(2, '0')}`;
    const txnId = randomUUID();
    await client.query(
      `INSERT INTO finance.transactions ("Id","UserId","CategoryId","Desc","Amount","Type","Date","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [txnId, req.user.id, t.CategoryId, t.Desc, t.Amount, t.Type, txDate]
    );

    // Log it
    const { rows } = await client.query(
      `INSERT INTO finance."recurringTransactionLogs"
        ("Id","UserId","RecurringId","Month","TransactionId","AppliedAt")
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
      [randomUUID(), req.user.id, req.params.id, month, txnId]
    );

    await client.query('COMMIT');
    return ok(res, rows[0], 201);
  } catch (e) {
    await client.query('ROLLBACK');
    return fail(res, e.message, 500);
  } finally {
    client.release();
  }
});

module.exports = router;

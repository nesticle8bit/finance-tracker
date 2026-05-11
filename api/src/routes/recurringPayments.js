const router = require('express').Router();
const { randomUUID } = require('crypto');
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// Records routes BEFORE /:id to avoid param conflict
// GET /api/recurring-payments/records?month=YYYY-MM
router.get('/records', async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return fail(res, 'month (YYYY-MM) required');
  try {
    const { rows } = await pool.query(
      `SELECT * FROM finance."recurringPaymentRecords" WHERE "UserId"=$1 AND "Month"=$2`,
      [req.user.id, month]
    );
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/recurring-payments/records
router.post('/records', async (req, res) => {
  const { paymentId, month, amount } = req.body;
  if (!paymentId || !month || amount == null) return fail(res, 'paymentId, month and amount are required');
  if (!/^\d{4}-\d{2}$/.test(month)) return fail(res, 'month must be YYYY-MM');
  try {
    const existing = await pool.query(
      `SELECT "Id" FROM finance."recurringPaymentRecords" WHERE "UserId"=$1 AND "PaymentId"=$2 AND "Month"=$3`,
      [req.user.id, paymentId, month]
    );
    if (existing.rowCount > 0) return fail(res, 'Ya registrado este mes', 409);

    const { rows } = await pool.query(
      `INSERT INTO finance."recurringPaymentRecords" ("Id","UserId","PaymentId","Month","Amount","PaidAt","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
      [randomUUID(), req.user.id, paymentId, month, amount]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// Templates CRUD
// GET /api/recurring-payments
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM finance."recurringPayments" WHERE "UserId"=$1 ORDER BY "SortOrder", "CreatedAt"`,
      [req.user.id]
    );
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/recurring-payments
router.post('/', async (req, res) => {
  const { name, icon, defaultAmount } = req.body;
  if (!name) return fail(res, 'name is required');
  try {
    const { rows } = await pool.query(
      `INSERT INTO finance."recurringPayments" ("Id","UserId","Name","Icon","DefaultAmount","CreatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
      [randomUUID(), req.user.id, name, icon || 'payment', defaultAmount || 0]
    );
    return ok(res, rows[0], 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/recurring-payments/:id
router.put('/:id', async (req, res) => {
  const { name, icon, defaultAmount } = req.body;
  if (!name) return fail(res, 'name is required');
  try {
    const { rows, rowCount } = await pool.query(
      `UPDATE finance."recurringPayments" SET "Name"=$1,"Icon"=$2,"DefaultAmount"=$3
       WHERE "Id"=$4 AND "UserId"=$5 RETURNING *`,
      [name, icon || 'payment', defaultAmount || 0, req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// DELETE /api/recurring-payments/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM finance."recurringPayments" WHERE "Id"=$1 AND "UserId"=$2`,
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) return fail(res, 'Not found', 404);
    return ok(res, null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

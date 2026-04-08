const router = require('express').Router();
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/export/json
router.get('/export/json', async (req, res) => {
  try {
    const [cats, txns, budget, limits] = await Promise.all([
      pool.query(`SELECT * FROM parameters.categories WHERE "UserId"=$1`, [req.user.id]),
      pool.query(`SELECT * FROM finance.transactions WHERE "UserId"=$1 ORDER BY "Date"`, [req.user.id]),
      pool.query(`SELECT "Budget" FROM finance."budgetConfig" WHERE "UserId"=$1`, [req.user.id]),
      pool.query(`SELECT * FROM finance."categoryLimit" WHERE "UserId"=$1`, [req.user.id]),
    ]);
    const payload = {
      categories: cats.rows,
      transactions: txns.rows,
      budget: budget.rows[0]?.Budget ?? 0,
      categoryLimits: limits.rows,
    };
    res.setHeader('Content-Disposition', 'attachment; filename="finance-tracker-export.json"');
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(payload, null, 2));
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/export/csv
router.get('/export/csv', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t."Date", t."Desc", t."Amount", t."Type", c."Name" AS "Category"
       FROM finance.transactions t
       JOIN parameters.categories c ON c."Id" = t."CategoryId"
       WHERE t."UserId"=$1 ORDER BY t."Date"`,
      [req.user.id]
    );
    const header = 'Date,Description,Amount,Type,Category\n';
    const body = rows.map(r =>
      `${r.Date},${JSON.stringify(r.Desc)},${r.Amount},${r.Type},${JSON.stringify(r.Category)}`
    ).join('\n');
    res.setHeader('Content-Disposition', 'attachment; filename="finance-tracker-export.csv"');
    res.setHeader('Content-Type', 'text/csv');
    return res.send(header + body);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/import
router.post('/import', async (req, res) => {
  const { categories, transactions, budget, categoryLimits } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        await client.query(
          `INSERT INTO parameters.categories ("Id","UserId","Name","Icon","Color","Type","IsDefault")
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT ("Id") DO UPDATE SET "Name"=$3,"Icon"=$4,"Color"=$5,"Type"=$6`,
          [cat.Id, req.user.id, cat.Name, cat.Icon || '', cat.Color || '', cat.Type, cat.IsDefault ?? false]
        );
      }
    }

    if (Array.isArray(transactions)) {
      for (const txn of transactions) {
        await client.query(
          `INSERT INTO finance.transactions ("Id","UserId","CategoryId","Desc","Amount","Type","Date","CreatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT ("Id") DO NOTHING`,
          [txn.Id, req.user.id, txn.CategoryId, txn.Desc || '', txn.Amount, txn.Type, txn.Date, txn.CreatedAt || new Date()]
        );
      }
    }

    if (budget != null) {
      await client.query(
        `INSERT INTO finance."budgetConfig" ("UserId","Budget") VALUES ($1,$2)
         ON CONFLICT ("UserId") DO UPDATE SET "Budget"=$2`,
        [req.user.id, budget]
      );
    }

    if (Array.isArray(categoryLimits)) {
      for (const lim of categoryLimits) {
        await client.query(
          `INSERT INTO finance."categoryLimit" ("UserId","CategoryId","Limit")
           VALUES ($1,$2,$3)
           ON CONFLICT ("UserId","CategoryId") DO UPDATE SET "Limit"=$3`,
          [req.user.id, lim.CategoryId, lim.Limit]
        );
      }
    }

    await client.query('COMMIT');
    return ok(res, null);
  } catch (e) {
    await client.query('ROLLBACK');
    return fail(res, e.message, 500);
  } finally {
    client.release();
  }
});

module.exports = router;

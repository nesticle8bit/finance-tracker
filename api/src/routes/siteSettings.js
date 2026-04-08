const router = require('express').Router();
const pool = require('../db');
const { ok, fail } = require('../response');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/site-settings (public)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM settings."siteSettings" LIMIT 1`);
    return ok(res, rows[0] || null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/site-settings (admin only)
router.put('/', auth, adminOnly, async (req, res) => {
  const fields = ['SiteName','Slogan','LoginSubtitle','Feature1Title','Feature1Desc','Feature2Title','Feature2Desc','Feature3Title','Feature3Desc'];
  const updates = fields.filter(f => req.body[f] != null);
  if (updates.length === 0) return fail(res, 'No valid fields provided');

  try {
    const setClause = updates.map((f, i) => `"${f}"=$${i + 1}`).join(',');
    const values = updates.map(f => req.body[f]);

    // Ensure a row exists first
    await pool.query(`INSERT INTO settings."siteSettings" DEFAULT VALUES ON CONFLICT DO NOTHING`);

    const { rows } = await pool.query(
      `UPDATE settings."siteSettings" SET ${setClause} RETURNING *`,
      values
    );
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

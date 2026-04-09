const router = require('express').Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { ok, fail } = require('../response');
const { signToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const { seedUserCategories } = require('../seed');

const UPLOADS_DIR = process.env.UPLOADS_PATH || '/app/uploads';
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Solo se permiten imágenes')),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return fail(res, 'Name, email and password are required');

  const normalEmail = email.trim().toLowerCase();
  try {
    const existing = await pool.query(
      `SELECT "Id" FROM authentications.users WHERE "Email" = $1`, [normalEmail]
    );
    if (existing.rowCount > 0) return fail(res, 'User with the same email already exists');

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO authentications.users ("Email","Name","PasswordHash")
       VALUES ($1,$2,$3) RETURNING *`,
      [normalEmail, name.trim(), hash]
    );
    const user = rows[0];
    await seedUserCategories(user.Id);
    return ok(res, signToken(user), 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'Email and password are required');

  try {
    const { rows } = await pool.query(
      `SELECT * FROM authentications.users WHERE "Email" = $1`, [email.trim().toLowerCase()]
    );
    const user = rows[0];
    if (!user) return fail(res, 'El usuario con el correo electrónico no existe en el sistema.', 401);
    if (!(await bcrypt.compare(password, user.PasswordHash)))
      return fail(res, 'La contraseña ingresada es incorrecta.', 401);

    await pool.query(
      `UPDATE authentications.users SET "LastSeenAt" = NOW() WHERE "Id" = $1`, [user.Id]
    );
    return ok(res, signToken(user));
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT "Id","Email","Name","Role","CreatedAt","LastSeenAt","AvatarUrl" FROM authentications.users WHERE "Id" = $1`,
      [req.user.id]
    );
    if (!rows[0]) return fail(res, 'User not found', 404);
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return fail(res, 'Name and email are required');
  const normalEmail = email.trim().toLowerCase();

  try {
    const taken = await pool.query(
      `SELECT "Id" FROM authentications.users WHERE "Email" = $1 AND "Id" != $2`,
      [normalEmail, req.user.id]
    );
    if (taken.rowCount > 0) return fail(res, 'Email is already in use by another account');

    const { rows } = await pool.query(
      `UPDATE authentications.users SET "Name"=$1,"Email"=$2 WHERE "Id"=$3
       RETURNING "Id","Email","Name","Role","CreatedAt","LastSeenAt","AvatarUrl"`,
      [name.trim(), normalEmail, req.user.id]
    );
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return fail(res, 'currentPassword and newPassword are required');

  try {
    const { rows } = await pool.query(
      `SELECT "PasswordHash" FROM authentications.users WHERE "Id" = $1`, [req.user.id]
    );
    if (!rows[0]) return fail(res, 'User not found', 404);
    if (!(await bcrypt.compare(currentPassword, rows[0].PasswordHash)))
      return fail(res, 'The current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE authentications.users SET "PasswordHash"=$1 WHERE "Id"=$2`, [hash, req.user.id]
    );
    return ok(res, null);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

// POST /api/auth/avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (!req.file) return fail(res, 'No image provided');
  try {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
    const filename = `${req.user.id}.webp`;
    const filepath = path.join(AVATARS_DIR, filename);

    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toFile(filepath);

    const avatarUrl = `/uploads/avatars/${filename}?t=${Date.now()}`;
    const { rows } = await pool.query(
      `UPDATE authentications.users SET "AvatarUrl"=$1 WHERE "Id"=$2
       RETURNING "Id","Email","Name","Role","CreatedAt","LastSeenAt","AvatarUrl"`,
      [avatarUrl, req.user.id]
    );
    return ok(res, rows[0]);
  } catch (e) {
    return fail(res, e.message, 500);
  }
});

module.exports = router;

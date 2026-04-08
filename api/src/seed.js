const pool = require('./db');

const DEFAULT_CATEGORIES = [
  { name: 'Restaurante',     icon: 'restaurant',    color: '#f97316', type: 'expense' },
  { name: 'Esenciales',      icon: 'home',          color: '#3b82f6', type: 'expense' },
  { name: 'Transporte',      icon: 'directions_car', color: '#8b5cf6', type: 'expense' },
  { name: 'Salud',           icon: 'local_hospital', color: '#ef4444', type: 'expense' },
  { name: 'Entretenimiento', icon: 'movie',          color: '#ec4899', type: 'expense' },
  { name: 'Compras',         icon: 'shopping_bag',   color: '#f59e0b', type: 'expense' },
  { name: 'Educación',       icon: 'school',         color: '#06b6d4', type: 'expense' },
  { name: 'Salario',         icon: 'payments',       color: '#22c55e', type: 'income' },
  { name: 'Freelance',       icon: 'work',           color: '#14b8a6', type: 'income' },
  { name: 'Otros',           icon: 'more_horiz',     color: '#6b7280', type: 'both' },
];

async function seedAppDefaults() {
  const client = await pool.connect();
  try {
    // Promote hardcoded admin
    await client.query(`
      UPDATE authentications.users SET "Role" = 'admin'
      WHERE "Email" = 'jjpoveda92@gmail.com' AND "Role" != 'admin'
    `);

    // Seed site settings if empty
    const { rowCount } = await client.query(`SELECT 1 FROM settings."siteSettings" LIMIT 1`);
    if (rowCount === 0) {
      await client.query(`INSERT INTO settings."siteSettings" DEFAULT VALUES`);
      console.log('Site settings seeded');
    }
  } finally {
    client.release();
  }
}

async function seedUserCategories(userId, client) {
  const owned = client || pool;
  for (const cat of DEFAULT_CATEGORIES) {
    await owned.query(
      `INSERT INTO parameters.categories ("UserId","Name","Icon","Color","Type","IsDefault")
       VALUES ($1,$2,$3,$4,$5,true)`,
      [userId, cat.name, cat.icon, cat.color, cat.type]
    );
  }
  await owned.query(
    `INSERT INTO finance."budgetConfig" ("UserId","Budget") VALUES ($1,0)
     ON CONFLICT ("UserId") DO NOTHING`,
    [userId]
  );
}

module.exports = { seedAppDefaults, seedUserCategories };

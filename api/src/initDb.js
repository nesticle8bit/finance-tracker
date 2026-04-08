const pool = require('./db');

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS authentications;
      CREATE SCHEMA IF NOT EXISTS parameters;
      CREATE SCHEMA IF NOT EXISTS finance;
      CREATE SCHEMA IF NOT EXISTS settings;

      CREATE TABLE IF NOT EXISTS authentications.users (
        "Id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "Email"        TEXT NOT NULL UNIQUE,
        "Name"         TEXT NOT NULL,
        "PasswordHash" TEXT NOT NULL,
        "Role"         TEXT NOT NULL DEFAULT 'user',
        "CreatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "LastSeenAt"   TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS parameters.categories (
        "Id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "UserId"    UUID NOT NULL REFERENCES authentications.users("Id") ON DELETE CASCADE,
        "Name"      TEXT NOT NULL,
        "Icon"      TEXT NOT NULL DEFAULT '',
        "Color"     TEXT NOT NULL DEFAULT '',
        "Type"      TEXT NOT NULL DEFAULT 'expense',
        "IsDefault" BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS finance.transactions (
        "Id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "UserId"     UUID NOT NULL REFERENCES authentications.users("Id") ON DELETE CASCADE,
        "CategoryId" UUID NOT NULL REFERENCES parameters.categories("Id") ON DELETE RESTRICT,
        "Desc"       TEXT NOT NULL DEFAULT '',
        "Amount"     NUMERIC(18,2) NOT NULL DEFAULT 0,
        "Type"       TEXT NOT NULL DEFAULT 'expense',
        "Date"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "CreatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS finance."budgetConfig" (
        "Id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "UserId" UUID NOT NULL UNIQUE REFERENCES authentications.users("Id") ON DELETE CASCADE,
        "Budget" NUMERIC(18,2) NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS finance."categoryLimit" (
        "Id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "UserId"     UUID NOT NULL REFERENCES authentications.users("Id") ON DELETE CASCADE,
        "CategoryId" UUID NOT NULL REFERENCES parameters.categories("Id") ON DELETE CASCADE,
        "Limit"      NUMERIC(18,2) NOT NULL DEFAULT 0,
        UNIQUE ("UserId", "CategoryId")
      );

      CREATE TABLE IF NOT EXISTS settings."siteSettings" (
        "Id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "SiteName"       TEXT NOT NULL DEFAULT 'Finance Tracker',
        "Slogan"         TEXT NOT NULL DEFAULT 'Controla tus finanzas, transforma tu futuro.',
        "LoginSubtitle"  TEXT NOT NULL DEFAULT 'Registra ingresos, gastos y presupuestos en un solo lugar.',
        "Feature1Title"  TEXT NOT NULL DEFAULT 'Análisis visual',
        "Feature1Desc"   TEXT NOT NULL DEFAULT 'Gráficas claras de tus movimientos diarios',
        "Feature2Title"  TEXT NOT NULL DEFAULT 'Presupuesto inteligente',
        "Feature2Desc"   TEXT NOT NULL DEFAULT 'Define límites por categoría y evita sobregastos',
        "Feature3Title"  TEXT NOT NULL DEFAULT 'Datos seguros',
        "Feature3Desc"   TEXT NOT NULL DEFAULT 'Autenticación JWT, tus datos solo son tuyos'
      );
    `);

    // Migrations: add columns to existing tables if they don't exist yet
    await client.query(`
      ALTER TABLE authentications.users
        ADD COLUMN IF NOT EXISTS "Role"       TEXT NOT NULL DEFAULT 'user',
        ADD COLUMN IF NOT EXISTS "LastSeenAt" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "AvatarUrl"  TEXT;
    `);

    console.log('DB schema ready');
  } finally {
    client.release();
  }
}

module.exports = initDb;

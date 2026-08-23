// Auto-migration: ensures ActivityLog and PaymentLog tables exist in SQLite
// Called once at server startup via Prisma raw SQL
const prisma = require("../config/db");

async function runMigrations() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ActivityLog (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        type      TEXT    NOT NULL DEFAULT 'INFO',
        action    TEXT    NOT NULL,
        category  TEXT    NOT NULL DEFAULT 'system',
        details   TEXT    NOT NULL,
        actor     TEXT    NOT NULL DEFAULT 'System',
        userId    INTEGER,
        orderId   TEXT,
        ipAddress TEXT,
        createdAt DATETIME NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS PaymentLog (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId       TEXT    NOT NULL,
        userId        INTEGER,
        customerName  TEXT    NOT NULL,
        amount        REAL    NOT NULL,
        paymentMethod TEXT    NOT NULL,
        status        TEXT    NOT NULL DEFAULT 'Pending',
        transactionId TEXT,
        notes         TEXT,
        createdAt     DATETIME NOT NULL DEFAULT (datetime('now'))
      )
    `);

    console.log("✅ ActivityLog & PaymentLog tables ready");
  } catch (err) {
    console.warn("⚠️  Migration attempted (tables may already exist):", err.message);
  }
}

module.exports = { runMigrations };

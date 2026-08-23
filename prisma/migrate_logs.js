// Direct SQLite migration: creates ActivityLog and PaymentLog tables
// Run this once: node prisma/migrate_logs.js
require("dotenv").config();
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");

// Find the SQLite database file
const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const dbPath = dbUrl.replace("file:", "").replace("./", "");
const absoluteDbPath = path.resolve(__dirname, "..", dbPath);

console.log("📦 Migrating SQLite database:", absoluteDbPath);

if (!fs.existsSync(absoluteDbPath)) {
  console.error("❌ Database file not found:", absoluteDbPath);
  process.exit(1);
}

const db = new Database(absoluteDbPath);

// Create ActivityLog table if not exists
db.prepare(`
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
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();
console.log("✅ ActivityLog table ready");

// Create PaymentLog table if not exists
db.prepare(`
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
    createdAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();
console.log("✅ PaymentLog table ready");

db.close();
console.log("🎉 Migration complete!");

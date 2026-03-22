const Database = require('better-sqlite3');
const path     = require('path');

const db = new Database(path.join(__dirname, 'bookings.db'));

// Create bookings table
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    status       TEXT DEFAULT 'pending',

    -- Tour details
    tour_type    TEXT NOT NULL,
    tour_date    TEXT NOT NULL,
    guests       INTEGER NOT NULL,
    train_addon  INTEGER DEFAULT 0,

    -- Customer details
    name         TEXT NOT NULL,
    email        TEXT NOT NULL,
    phone        TEXT NOT NULL,
    requests     TEXT,

    -- Pricing
    tour_price   REAL NOT NULL,
    train_price  REAL DEFAULT 0,
    total_price  REAL NOT NULL,

    -- Internal notes
    notes        TEXT
  )
`);

module.exports = db;

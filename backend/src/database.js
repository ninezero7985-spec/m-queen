const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../database.db'))

// Jadvallar yaratish
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    old_price REAL,
    category TEXT,
    sizes TEXT,
    colors TEXT,
    stock INTEGER,
    images TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    phone TEXT,
    delivery_type TEXT,
    city TEXT,
    street TEXT,
    house TEXT,
    payment_method TEXT,
    items TEXT,
    subtotal REAL,
    delivery_fee REAL,
    total REAL,
    note TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT DEFAULT (datetime('now'))
  );
`)

module.exports = db
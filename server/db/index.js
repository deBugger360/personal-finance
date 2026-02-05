const Database = require('better-sqlite3');
const path = require('path');

// finance.db is in the project root (../../finance.db from server/db/index.js)
const dbPath = path.resolve(__dirname, '../../finance.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

function initDb() {
  const schema = `
    -- 1. Configuration
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- 2. Categories
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT CHECK(type IN ('income', 'expense', 'savings')) NOT NULL,
      icon TEXT DEFAULT '📦',
      is_hidden BOOLEAN DEFAULT 0
    );

    -- 3. Budgets (New)
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      month_iso TEXT NOT NULL, -- Format: 'YYYY-MM'
      amount REAL NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(category_id, month_iso)
    );

    -- 4. Goals (Enhanced)
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      saved_amount REAL DEFAULT 0,
      deadline TEXT,
      priority INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3)),
      is_completed BOOLEAN DEFAULT 0
    );

    -- 5. Transactions (Enhanced)
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      goal_id INTEGER,
      type TEXT CHECK(type IN ('income', 'expense', 'transfer')) NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_trans_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month_iso);
  `;

  db.exec(schema);

  // Seed default categories if empty
  const stmt = db.prepare('SELECT count(*) as count FROM categories');
  const row = stmt.get();
  if (row.count === 0) {
    const insert = db.prepare('INSERT INTO categories (name, type, icon) VALUES (?, ?, ?)');
    const defaults = [
      ['Salary', 'income', '💰'],
      ['Freelance', 'income', '💻'],
      ['Rent/Mortgage', 'expense', '🏠'],
      ['Groceries', 'expense', '🛒'],
      ['Utilities', 'expense', '💡'],
      ['Transport', 'expense', '🚌'],
      ['Dining Out', 'expense', '🍽️'],
      ['Health', 'expense', '💊'],
      ['Shopping', 'expense', '🛍️'],
      ['Entertainment', 'expense', '🎬'],
      ['Education', 'expense', '📚'],
      ['Savings', 'savings', '🏦'],
      ['Family', 'expense', '👨‍👩‍👧‍👦'],
      ['Charity', 'expense', '❤️']
    ];
    const transaction = db.transaction((cats) => {
      for (const cat of cats) insert.run(cat);
    });
    transaction(defaults);
    console.log('Seeded default categories.');
  }
}

module.exports = { db, initDb };

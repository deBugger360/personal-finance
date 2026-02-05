function up(db) {
  // 1. Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 2. Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT CHECK(type IN ('income', 'expense', 'savings')) NOT NULL,
      icon TEXT DEFAULT '📦'
    );
  `);
  
  // Idempotent add column: is_hidden
  ensureColumn(db, 'categories', 'is_hidden', 'BOOLEAN DEFAULT 0');

  // 3. Budgets
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      month_iso TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE(category_id, month_iso)
    );
  `);

  // 4. Goals
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL
    );
  `);

  // Idempotent add columns for Goals
  ensureColumn(db, 'goals', 'saved_amount', 'REAL DEFAULT 0');
  ensureColumn(db, 'goals', 'deadline', 'TEXT');
  ensureColumn(db, 'goals', 'priority', 'INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3))');
  ensureColumn(db, 'goals', 'is_completed', 'BOOLEAN DEFAULT 0');

  // 5. Transactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense', 'transfer')) NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // Idempotent add column: goal_id
  ensureColumn(db, 'transactions', 'goal_id', 'INTEGER REFERENCES goals(id) ON DELETE SET NULL');

  // 6. Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_trans_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_trans_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month_iso);
  `);

  // 7. Seed Categories (Only if empty)
  const count = db.prepare('SELECT count(*) as count FROM categories').get().count;
  if (count === 0) {
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
    for (const cat of defaults) insert.run(cat);
    console.log('Seeded default categories');
  }
}

function ensureColumn(db, table, column, definition) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some(c => c.name === column);
  if (!exists) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    console.log(`Added column ${column} to ${table}`);
  }
}

module.exports = { up };

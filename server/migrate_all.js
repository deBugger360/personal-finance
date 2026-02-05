const { db } = require('./server/db/index.js');

console.log('Running robust migration script...');

function addColumn(table, column, definition) {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    console.log(`✅ Added ${column} to ${table}`);
  } catch (e) {
    if (e.message.includes('duplicate column')) {
      console.log(`ℹ️  ${column} already exists in ${table}`);
    } else {
      console.error(`❌ Failed to add ${column} to ${table}: ${e.message}`);
    }
  }
}

// 1. Fix Goals
addColumn('goals', 'is_completed', 'BOOLEAN DEFAULT 0');
addColumn('goals', 'priority', 'INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3))');
addColumn('goals', 'saved_amount', 'REAL DEFAULT 0'); // Denormalized cache

// 2. Fix Transactions
addColumn('transactions', 'goal_id', 'INTEGER REFERENCES goals(id) ON DELETE SET NULL');

console.log('Migration check complete.');

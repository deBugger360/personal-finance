const fs = require('fs');
const path = require('path');

function migrate(db) {
  // 1. Create migrations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Read migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    // Check if applied
    const row = db.prepare('SELECT id FROM _migrations WHERE name = ?').get(file);
    if (row) {
      continue; // Skip applied
    }

    console.log(`Running migration: ${file}`);
    
    // Load and run migration
    const migration = require(path.join(migrationsDir, file));
    
    try {
      db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      })();
      console.log(`✅ Applied ${file}`);
    } catch (err) {
      console.error(`❌ Failed to apply ${file}:`, err);
      process.exit(1); // Stop on failure
    }
  }
}

module.exports = { migrate };

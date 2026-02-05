const { db } = require('./server/db');

try {
  console.log('Applying migrations...');
  
  try {
    db.prepare('ALTER TABLE goals ADD COLUMN is_completed BOOLEAN DEFAULT 0').run();
    console.log('Added is_completed to goals');
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.log('Goals migration skipped/failed:', e.message);
  }

  try {
    db.prepare('ALTER TABLE goals ADD COLUMN priority INTEGER DEFAULT 2 CHECK(priority IN (1, 2, 3))').run();
    console.log('Added priority to goals');
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.log('Priority migration skipped/failed:', e.message);
  }

  try {
    db.prepare('ALTER TABLE goals ADD COLUMN saved_amount REAL DEFAULT 0').run();
    console.log('Added saved_amount to goals');
  } catch (e) {
    if (!e.message.includes('duplicate column')) console.log('Saved_amount migration skipped/failed:', e.message);
  }

  console.log('Migrations done.');
} catch(e) {
  console.error('Migration script error:', e);
}

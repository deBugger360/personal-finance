function up(db) {
  // Example of safely adding a column to an existing table
  // We want to add a 'description' field to categories
  
  const columns = db.prepare("PRAGMA table_info(categories)").all();
  const exists = columns.some(c => c.name === 'description');
  
  if (!exists) {
    db.prepare("ALTER TABLE categories ADD COLUMN description TEXT").run();
    console.log("✅ Added description column to categories");
  } else {
    console.log("ℹ️ Description column already exists in categories (Skipped)");
  }
}

module.exports = { up };

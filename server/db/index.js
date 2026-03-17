const Database = require('better-sqlite3');
const path = require('path');

// finance.db is in the project root (../../finance.db from server/db/index.js)
const dbPath = process.env.DATABASE_URL || process.env.DB_PATH || path.resolve(__dirname, '../../finance.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');
// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

const { migrate } = require('./migrate');

function initDb() {
  migrate(db);
}

module.exports = { db, initDb };

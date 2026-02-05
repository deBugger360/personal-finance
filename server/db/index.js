const Database = require('better-sqlite3');
const path = require('path');

// finance.db is in the project root (../../finance.db from server/db/index.js)
const dbPath = path.resolve(__dirname, '../../finance.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

const { migrate } = require('./migrate');

function initDb() {
  migrate(db);
}

module.exports = { db, initDb };

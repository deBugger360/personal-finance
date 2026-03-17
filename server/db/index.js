const mysql = require('mysql2/promise');

// Configuration - In production, these should come from environment variables
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'personal_finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDb() {
  console.log('Initializing MySQL Database...');
  
  // Create tables using MySQL syntax
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(100) PRIMARY KEY,
        \`value\` TEXT NOT NULL
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type ENUM('income', 'expense', 'savings') NOT NULL,
        icon VARCHAR(50) DEFAULT '📦',
        is_hidden TINYINT(1) DEFAULT 0,
        description TEXT
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        month_iso VARCHAR(7) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY category_month (category_id, month_iso)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        target_amount DECIMAL(15, 2) NOT NULL,
        saved_amount DECIMAL(15, 2) DEFAULT 0,
        deadline DATE,
        priority INT DEFAULT 2,
        is_completed TINYINT(1) DEFAULT 0
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description VARCHAR(255),
        category_id INT NOT NULL,
        goal_id INT NULL,
        type ENUM('income', 'expense', 'transfer') NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
        INDEX idx_date (date),
        INDEX idx_category (category_id)
      )
    `);

    // Seed categories if empty
    const [rows] = await conn.query('SELECT COUNT(*) as count FROM categories');
    if (rows[0].count === 0) {
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
      await conn.query('INSERT INTO categories (name, type, icon) VALUES ?', [defaults]);
      console.log('Seeded default categories');
    }

    console.log('MySQL Database Initialized Check ✅');
  } catch (err) {
    console.error('MySQL Init Error:', err);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDb };

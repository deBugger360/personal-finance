const mysql = require('mysql2/promise');

// NOTE: On cPanel, database names are prefixed with your account username
// e.g. if your cPanel user is "dabiusv7f" and DB is "personal_finance",
// set MYSQL_DATABASE=dabiusv7f_personal_finance in your Vercel env vars.
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST     || 'localhost',
  port:     Number(process.env.MYSQL_PORT) || 3306,
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'personal_finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
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
        name VARCHAR(100) CHARACTER SET utf8mb4 NOT NULL UNIQUE,
        type ENUM('income', 'expense', 'savings') NOT NULL,
        icon VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT NULL,
        is_hidden TINYINT(1) DEFAULT 0,
        description TEXT CHARACTER SET utf8mb4
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
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

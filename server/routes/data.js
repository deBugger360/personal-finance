const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();

// GET /api/data/export
router.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query;

  if (format === 'csv') {
    const [transactions] = await pool.query(`
      SELECT t.date, t.amount, t.type, c.name as category, t.description 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      ORDER BY t.date DESC
    `);

    const headers = ['date', 'amount', 'type', 'category', 'description'];
    const csvRows = [headers.join(',')];
    for (const t of transactions) {
      const row = headers.map(h => `"${String(t[h] || '').replace(/"/g, '""')}"`);
      csvRows.push(row.join(','));
    }
    const filename = `pf_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvRows.join('\n'));
  }

  // JSON Backup (Full State)
  const [settings]     = await pool.query('SELECT * FROM settings');
  const [categories]   = await pool.query('SELECT * FROM categories');
  const [budgets]      = await pool.query('SELECT * FROM budgets');
  const [goals]        = await pool.query('SELECT * FROM goals');
  const [transactions] = await pool.query('SELECT * FROM transactions');

  const data = {
    meta: { version: 1, exported_at: new Date().toISOString(), app: 'personal-finance-mysql' },
    settings, categories, budgets, goals, transactions
  };

  const filename = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(data, null, 2));
}));

// POST /api/data/import
router.post('/import', asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.meta || !Array.isArray(data.transactions)) {
    throw new AppError('Invalid backup file format', 400);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM transactions');
    await conn.query('DELETE FROM budgets');
    await conn.query('DELETE FROM goals');
    await conn.query('DELETE FROM categories');
    await conn.query('DELETE FROM settings');

    for (const row of data.settings || [])
      await conn.query('INSERT INTO settings (`key`, value) VALUES (?, ?)', [row.key, row.value]);

    for (const row of data.categories || [])
      await conn.query('INSERT INTO categories (id, name, type, icon, is_hidden, description) VALUES (?, ?, ?, ?, ?, ?)',
        [row.id, row.name, row.type, row.icon, row.is_hidden, row.description]);

    for (const row of data.goals || [])
      await conn.query('INSERT INTO goals (id, name, target_amount, saved_amount, deadline, priority, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.name, row.target_amount, row.saved_amount, row.deadline, row.priority, row.is_completed]);

    for (const row of data.budgets || [])
      await conn.query('INSERT INTO budgets (id, category_id, month_iso, amount) VALUES (?, ?, ?, ?)',
        [row.id, row.category_id, row.month_iso, row.amount]);

    for (const row of data.transactions || [])
      await conn.query('INSERT INTO transactions (id, date, amount, description, category_id, goal_id, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.date, row.amount, row.description, row.category_id, row.goal_id, row.type]);

    await conn.commit();
    res.json({ success: true, message: 'Restore successful', stats: { transactions: data.transactions.length } });
  } catch (err) {
    await conn.rollback();
    throw new AppError('Restore failed: ' + err.message, 500);
  } finally {
    conn.release();
  }
}));

module.exports = router;

const express = require('express');
const { db } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();

/**
 * GET /api/data/export
 * Download full database state as JSON
 */
router.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query;

  // CSV Export (Transactions Only)
  if (format === 'csv') {
    const transactions = db.prepare(`
      SELECT t.date, t.amount, t.type, c.name as category, t.description 
      FROM transactions t 
      LEFT JOIN categories c ON t.category_id = c.id 
      ORDER BY t.date DESC
    `).all();

    const headers = ['date', 'amount', 'type', 'category', 'description'];
    const csvRows = [headers.join(',')];

    for (const t of transactions) {
      const row = headers.map(h => {
        const val = t[h] || '';
        // Escape quotes and wrap in quotes if contains comma
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    }

    const filename = `pf_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvRows.join('\n'));
  }

  // JSON Backup (Full State)
  const data = {
    meta: {
      version: 1,
      exported_at: new Date().toISOString(),
      app: "personal-finance-local"
    },
    settings: db.prepare('SELECT * FROM settings').all(),
    categories: db.prepare('SELECT * FROM categories').all(),
    budgets: db.prepare('SELECT * FROM budgets').all(),
    goals: db.prepare('SELECT * FROM goals').all(),
    transactions: db.prepare('SELECT * FROM transactions').all()
  };

  const filename = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(data, null, 2));
}));

/**
 * POST /api/data/import
 * Restore database from JSON backup (DANGEROUS: Wipes existing data)
 */
router.post('/import', asyncHandler(async (req, res) => {
  const data = req.body;

  if (!data.meta || !Array.isArray(data.transactions)) {
    throw new AppError('Invalid backup file format', 400);
  }

  // Transactional Restore
  const restore = db.transaction(() => {
    // 1. Wipe existing data (Order matters because of Foreign Keys)
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM budgets').run();
    db.prepare('DELETE FROM goals').run();
    // We don't delete categories to avoid breaking icons if IDs shift, 
    // but a full restore should probably respect the backup's IDs exactly.
    // For this implementation, we will wipe categories too, trusting the backup has them.
    db.prepare('DELETE FROM categories').run(); 
    db.prepare('DELETE FROM settings').run();

    // 2. Insert Settings
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (@key, @value)');
    for (const row of data.settings || []) insertSetting.run(row);

    // 3. Insert Categories (Preserve IDs)
    const insertCat = db.prepare('INSERT INTO categories (id, name, type, icon, is_hidden, description) VALUES (@id, @name, @type, @icon, @is_hidden, @description)');
    for (const row of data.categories || []) insertCat.run(row);

    // 4. Insert Goals
    const insertGoal = db.prepare('INSERT INTO goals (id, name, target_amount, saved_amount, deadline, priority, is_completed) VALUES (@id, @name, @target_amount, @saved_amount, @deadline, @priority, @is_completed)');
    for (const row of data.goals || []) insertGoal.run(row);

    // 5. Insert Budgets
    const insertBudget = db.prepare('INSERT INTO budgets (id, category_id, month_iso, amount) VALUES (@id, @category_id, @month_iso, @amount)');
    for (const row of data.budgets || []) insertBudget.run(row);

    // 6. Insert Transactions
    const insertTrans = db.prepare('INSERT INTO transactions (id, date, amount, description, category_id, goal_id, type) VALUES (@id, @date, @amount, @description, @category_id, @goal_id, @type)');
    for (const row of data.transactions || []) insertTrans.run(row);
  });

  try {
    restore();
    console.log(`System restored from backup: ${data.transactions.length} transactions recovered.`);
    res.json({ success: true, message: "Restore successful", stats: { transactions: data.transactions.length } });
  } catch (err) {
    console.error("Restore failed:", err);
    throw new AppError('Restore failed: ' + err.message, 500);
  }
}));

module.exports = router;

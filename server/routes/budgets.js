const express = require('express');
const { db } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();

// Get budgets status for a specific month (Budget vs Actual)
router.get('/status', asyncHandler(async (req, res) => {
  const { month } = req.query; // YYYY-MM
  if (!month) throw new AppError('Month required', 400);

  // Complex query: Join Categories + Budgets + Transactions Sum
  const stmt = db.prepare(`
    SELECT 
      c.id, 
      c.name, 
      c.icon,
      COALESCE(b.amount, 0) as budget_limit,
      COALESCE(SUM(t.amount), 0) as spent,
      (COALESCE(b.amount, 0) - COALESCE(SUM(t.amount), 0)) as remaining,
      CASE WHEN b.amount > 0 THEN 1 ELSE 0 END as has_budget
    FROM categories c
    LEFT JOIN budgets b ON c.id = b.category_id AND b.month_iso = ?
    LEFT JOIN transactions t ON c.id = t.category_id 
       AND strftime('%Y-%m', t.date) = ?
       AND t.type = 'expense'
    WHERE c.type = 'expense' AND c.is_hidden = 0
    GROUP BY c.id
    ORDER BY spent DESC
  `);

  res.json(stmt.all(month, month));
}));

// Set a budget for a category/month
router.post('/', asyncHandler(async (req, res) => {
  const { category_id, month, amount } = req.body;
  
  if (!category_id || !month) {
    throw new AppError('Category ID and Month are required', 400);
  }

  if (amount > 0) {
    const stmt = db.prepare(`
      INSERT INTO budgets (category_id, month_iso, amount)
      VALUES (?, ?, ?)
      ON CONFLICT(category_id, month_iso) 
      DO UPDATE SET amount = excluded.amount
    `);
    stmt.run(category_id, month, amount);
  } else {
    // If setting to 0, effectively delete the budget limit
    const stmt = db.prepare('DELETE FROM budgets WHERE category_id = ? AND month_iso = ?');
    stmt.run(category_id, month);
  }
  
  res.json({ success: true });
}));

module.exports = router;

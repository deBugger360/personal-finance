const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();
const { budgetSchema } = require('../lib/schemas');
const { validate } = require('../middleware/validate');

// Get budgets status for a specific month (Budget vs Actual)
router.get('/status', asyncHandler(async (req, res) => {
  const { month } = req.query;
  if (!month) throw new AppError('Month required', 400);

  const [rows] = await pool.query(`
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
       AND DATE_FORMAT(t.date, '%Y-%m') = ?
       AND t.type = 'expense'
    WHERE c.type = 'expense' AND c.is_hidden = 0
    GROUP BY c.id, c.name, c.icon, b.amount
    ORDER BY spent DESC
  `, [month, month]);

  res.json(rows);
}));

// Set a budget for a category/month
router.post('/', validate(budgetSchema), asyncHandler(async (req, res) => {
  const { category_id, month, amount } = req.body;

  if (amount > 0) {
    await pool.query(`
      INSERT INTO budgets (category_id, month_iso, amount)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE amount = VALUES(amount)
    `, [category_id, month, amount]);
  } else {
    await pool.query('DELETE FROM budgets WHERE category_id = ? AND month_iso = ?', [category_id, month]);
  }

  res.json({ success: true });
}));

module.exports = router;

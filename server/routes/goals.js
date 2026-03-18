const express = require('express');
const { pool } = require('../db');
const router = express.Router();
const { asyncHandler, AppError } = require('../middleware/error');
const { goalSchema, fundGoalSchema } = require('../lib/schemas');
const { validate } = require('../middleware/validate');

// Get all goals with computed progress
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT 
      g.*,
      COALESCE(SUM(CASE 
        WHEN t.type = 'transfer' THEN t.amount 
        WHEN t.type = 'expense' THEN -t.amount 
        ELSE 0 
      END), 0) as current_balance
    FROM goals g
    LEFT JOIN transactions t ON g.id = t.goal_id
    WHERE g.is_completed = 0
    GROUP BY g.id
    ORDER BY g.priority ASC, g.deadline ASC
  `);
  res.json(rows);
}));

// Create a new goal
router.post('/', validate(goalSchema), asyncHandler(async (req, res) => {
  const { name, target_amount, deadline, priority } = req.body;
  const [result] = await pool.query(
    'INSERT INTO goals (name, target_amount, deadline, priority) VALUES (?, ?, ?, ?)',
    [name, target_amount, deadline || null, priority || 2]
  );
  res.json({ id: result.insertId });
}));

// "Fund" a goal (Internal Transfer)
router.post('/:id/fund', validate(fundGoalSchema), asyncHandler(async (req, res) => {
  const goalId = req.params.id;
  const { amount, date } = req.body;

  // Verify goal exists
  const [goalRows] = await pool.query('SELECT id FROM goals WHERE id = ?', [goalId]);
  if (goalRows.length === 0) throw new AppError('Goal not found', 404);

  // Find 'Savings' category
  const [catRows] = await pool.query("SELECT id FROM categories WHERE type = 'savings' LIMIT 1");
  if (catRows.length === 0) throw new AppError('No Savings category found', 500);

  await pool.query(
    "INSERT INTO transactions (date, amount, description, category_id, type, goal_id) VALUES (?, ?, ?, ?, 'transfer', ?)",
    [date || new Date().toISOString().split('T')[0], amount, 'Saved towards goal', catRows[0].id, goalId]
  );
  res.json({ success: true });
}));

module.exports = router;

const express = require('express');
const { db } = require('../db');
const router = express.Router();

// Get all goals with computed progress
router.get('/', (req, res) => {
  const stmt = db.prepare(`
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
  res.json(stmt.all());
});

// Create a new goal
router.post('/', (req, res) => {
  const { name, target_amount, deadline, priority } = req.body;
  const stmt = db.prepare(`
    INSERT INTO goals (name, target_amount, deadline, priority)
    VALUES (?, ?, ?, ?)
  `);
  const result = stmt.run(name, target_amount, deadline || null, priority || 2);
  res.json({ id: result.lastInsertRowid });
});

// "Fund" a goal (Internal Transfer)
router.post('/:id/fund', (req, res) => {
  const goalId = req.params.id;
  const { amount, date } = req.body;
  
  // Find 'Savings' category for the transaction (fallback to ID 12 or search)
  const catStmt = db.prepare("SELECT id FROM categories WHERE type = 'savings' LIMIT 1");
  const cat = catStmt.get();
  
  if (!cat) return res.status(500).json({ error: 'No Savings category found' });

  const stmt = db.prepare(`
    INSERT INTO transactions (date, amount, description, category_id, type, goal_id)
    VALUES (?, ?, ?, ?, 'transfer', ?)
  `);
  
  stmt.run(date || new Date().toISOString().split('T')[0], amount, 'Saved towards goal', cat.id, goalId);
  res.json({ success: true });
});

module.exports = router;

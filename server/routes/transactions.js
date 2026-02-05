const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  let query = 'SELECT t.*, c.name as category_name, c.icon as category_icon FROM transactions t LEFT JOIN categories c ON t.category_id = c.id';
  const params = [];
  
  if (month) {
    query += " WHERE strftime('%Y-%m', t.date) = ?";
    params.push(month);
  }
  
  query += ' ORDER BY t.date DESC';
  
  const stmt = db.prepare(query);
  res.json(stmt.all(...params));
});

router.post('/', (req, res) => {
  const { date, amount, description, category_id, type } = req.body;
  const stmt = db.prepare('INSERT INTO transactions (date, amount, description, category_id, type) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(date, amount, description, category_id, type);
  res.json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  stmt.run(id);
  res.json({ success: true });
});

module.exports = router;

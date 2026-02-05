const express = require('express');
const { db } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
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
}));

router.post('/', asyncHandler(async (req, res) => {
  const { date, amount, description, category_id, type } = req.body;
  
  if (!amount || !category_id || !type) {
    throw new AppError('Amount, Category, and Type are required', 400);
  }

  const stmt = db.prepare('INSERT INTO transactions (date, amount, description, category_id, type) VALUES (?, ?, ?, ?, ?)');
  const result = stmt.run(date || new Date().toISOString(), amount, description, category_id, type);
  res.json({ id: result.lastInsertRowid });
}));

router.post('/batch', asyncHandler(async (req, res) => {
  const transactions = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new AppError('Invalid batch data', 400);
  }

  const insert = db.prepare('INSERT INTO transactions (date, amount, description, category_id, type) VALUES (@date, @amount, @description, @category_id, @type)');
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });

  insertMany(transactions);
  res.json({ success: true, count: transactions.length });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, amount, description, category_id, type } = req.body;
  
  const stmt = db.prepare(`
    UPDATE transactions 
    SET date = COALESCE(?, date),
        amount = COALESCE(?, amount),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        type = COALESCE(?, type)
    WHERE id = ?
  `);
  
  const result = stmt.run(date, amount, description, category_id, type, id);

  if (result.changes === 0) {
    throw new AppError('Transaction not found', 404);
  }

  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
  const result = stmt.run(id);
  
  if (result.changes === 0) {
    throw new AppError('Transaction not found', 404);
  }
  
  res.json({ success: true });
}));

module.exports = router;

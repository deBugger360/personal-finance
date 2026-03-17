const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();
const { transactionSchema } = require('../lib/schemas');
const { validate } = require('../middleware/validate');

router.get('/', asyncHandler(async (req, res) => {
  const { month } = req.query; // Format: YYYY-MM
  let query = 'SELECT t.*, c.name as category_name, c.icon as category_icon FROM transactions t LEFT JOIN categories c ON t.category_id = c.id';
  const params = [];
  
  if (month) {
    query += " WHERE DATE_FORMAT(t.date, '%Y-%m') = ?";
    params.push(month);
  } else {
    // Default to current month to prevent huge payloads in production
    const current = new Date().toISOString().slice(0, 7);
    query += " WHERE DATE_FORMAT(t.date, '%Y-%m') = ?";
    params.push(current);
  }
  
  query += ' ORDER BY t.date DESC';
  
  const [rows] = await pool.query(query, params);
  res.json(rows);
}));

router.post('/', validate(transactionSchema), asyncHandler(async (req, res) => {
  const { date, amount, description, category_id, type } = req.body;

  const [result] = await pool.query(
    'INSERT INTO transactions (date, amount, description, category_id, type) VALUES (?, ?, ?, ?, ?)',
    [date, amount, description, category_id, type]
  );
  res.json({ id: result.insertId });
}));

router.post('/batch', asyncHandler(async (req, res) => {
  const transactions = req.body;
  if (!Array.isArray(transactions) || transactions.length === 0) {
    throw new AppError('Invalid batch data', 400);
  }

  // Security: Prevent DoS via recursive event loop blocking
  if (transactions.length > 5000) {
    throw new AppError('Batch exceeds limit (max 5,000)', 400);
  }

  // Basic validation and formatting for bulk insert
  const values = [];
  for (const t of transactions) {
     const clean = transactionSchema.parse(t);
     values.push([clean.date, clean.amount, clean.description, clean.category_id, clean.type]);
  }

  const [result] = await pool.query(
    'INSERT INTO transactions (date, amount, description, category_id, type) VALUES ?',
    [values]
  );
  
  res.json({ success: true, count: result.affectedRows });
}));

router.put('/:id', validate(transactionSchema), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, amount, description, category_id, type } = req.body;
  
  const [result] = await pool.query(`
    UPDATE transactions 
    SET date = ?,
        amount = ?,
        description = ?,
        category_id = ?,
        type = ?
    WHERE id = ?
  `, [date, amount, description, category_id, type, id]);

  if (result.affectedRows === 0) {
    throw new AppError('Transaction not found', 404);
  }

  res.json({ success: true });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
  
  if (result.affectedRows === 0) {
    throw new AppError('Transaction not found', 404);
  }
  
  res.json({ success: true });
}));

module.exports = router;

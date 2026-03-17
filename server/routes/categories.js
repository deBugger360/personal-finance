const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../middleware/error');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories WHERE is_hidden = 0 ORDER BY name ASC');
  res.json(rows);
}));

router.get('/all', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name, type, icon, description } = req.body;
  const [result] = await pool.query(
    'INSERT INTO categories (name, type, icon, description) VALUES (?, ?, ?, ?)',
    [name, type, icon || '📦', description]
  );
  res.json({ id: result.insertId });
}));

module.exports = router;

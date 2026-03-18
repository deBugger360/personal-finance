const express = require('express');
const { pool } = require('../db');
const router = express.Router();
const { asyncHandler } = require('../middleware/error');
const { settingsSchema } = require('../lib/schemas');
const { validate } = require('../middleware/validate');

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM settings');
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
}));

router.post('/', validate(settingsSchema), asyncHandler(async (req, res) => {
  const { salary } = req.body;
  await pool.query(
    'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
    ['monthly_salary', String(salary)]
  );
  res.json({ success: true });
}));

module.exports = router;

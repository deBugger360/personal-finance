const express = require('express');
const { db } = require('../db');
const router = express.Router();

const { asyncHandler } = require('../middleware/error');
const { settingsSchema } = require('../lib/schemas');
const { validate } = require('../middleware/validate');

router.get('/', asyncHandler(async (req, res) => {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
}));

router.post('/', validate(settingsSchema), asyncHandler(async (req, res) => {
  const { salary } = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  stmt.run('monthly_salary', String(salary));
  res.json({ success: true });
}));

module.exports = router;

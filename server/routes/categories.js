const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  res.json(stmt.all());
});

module.exports = router;

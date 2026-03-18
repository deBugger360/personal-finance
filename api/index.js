/**
 * Vercel Serverless Entry Point
 * This file re-exports the Express app for Vercel's serverless runtime.
 * Vercel handles the HTTP listening — we just provide the handler.
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initDb } = require('../server/db');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Routes (paths relative to this file)
app.use('/api/settings',     require('../server/routes/settings'));
app.use('/api/categories',   require('../server/routes/categories'));
app.use('/api/transactions', require('../server/routes/transactions'));
app.use('/api/summary',      require('../server/routes/summary'));
app.use('/api/budgets',      require('../server/routes/budgets'));
app.use('/api/goals',        require('../server/routes/goals'));
app.use('/api/insights',     require('../server/routes/insights'));
app.use('/api/forecast',     require('../server/routes/forecast'));
app.use('/api/data',         require('../server/routes/data'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// Error Handling
const { errorHandler } = require('../server/middleware/error');
app.use(errorHandler);

// Initialize DB once (Vercel caches warm lambdas)
let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await initDb();
      dbReady = true;
    } catch (err) {
      console.error('DB init failed:', err.message);
      return res.status(500).json({ error: 'Database unavailable', detail: err.message });
    }
  }
  return app(req, res);
};

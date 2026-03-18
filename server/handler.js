/**
 * Vercel Serverless Handler
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initDb } = require('./db/index');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Routes
app.use('/api/settings',     require('./routes/settings'));
app.use('/api/categories',   require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/summary',      require('./routes/summary'));
app.use('/api/budgets',      require('./routes/budgets'));
app.use('/api/goals',        require('./routes/goals'));
app.use('/api/insights',     require('./routes/insights'));
app.use('/api/forecast',     require('./routes/forecast'));
app.use('/api/data',         require('./routes/data'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', provider: 'TiDB' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

app.use(require('./middleware/error').errorHandler);

let dbReady = false;
module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await initDb();
      dbReady = true;
    } catch (err) {
      console.error('DB init failed:', err.message);
    }
  }
  return app(req, res);
};

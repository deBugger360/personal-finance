const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check endpoint for Vercel
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// Error Handling (Must be last)
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

// Initialize DB then start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize DB:', err);
    process.exit(1);
  });

module.exports = app; // Export for Vercel serverless

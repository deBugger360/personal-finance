const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDb } = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initialize DB
initDb();

// Routes
app.use('/api/settings', require('./routes/settings'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/summary', require('./routes/summary'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/data', require('./routes/data'));

// Error Handling (Must be last)
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

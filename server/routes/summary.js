const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const { month } = req.query; // YYYY-MM
  if (!month) return res.status(400).json({ error: 'Month required' });
  
  const incomeStmt = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE strftime('%Y-%m', date) = ? AND type = 'income'");
  const expenseStmt = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE strftime('%Y-%m', date) = ? AND type = 'expense'");
  
  const income = incomeStmt.get(month).total || 0;
  const expense = expenseStmt.get(month).total || 0;
  
  // Get Salary Setting
  const salaryStmt = db.prepare("SELECT value FROM settings WHERE key = 'monthly_salary'");
  const salaryRow = salaryStmt.get();
  const salary = salaryRow ? parseFloat(salaryRow.value) : 0;
  
  const totalIncome = salary + income;
  
  res.json({
    salary,
    extra_income: income,
    total_income: totalIncome,
    total_expense: expense,
    balance: totalIncome - expense
  });
});

module.exports = router;

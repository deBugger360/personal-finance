const express = require('express');
const { pool } = require('../db');
const { asyncHandler, AppError } = require('../middleware/error');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { month } = req.query; // YYYY-MM
  if (!month) throw new AppError('Month required', 400);
  
  const [incomeRows] = await pool.query(
    "SELECT SUM(amount) as total FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND type = 'income'", 
    [month]
  );
  const [expenseRows] = await pool.query(
    "SELECT SUM(amount) as total FROM transactions WHERE DATE_FORMAT(date, '%Y-%m') = ? AND type = 'expense'",
    [month]
  );
  
  const income = incomeRows[0].total || 0;
  const expense = expenseRows[0].total || 0;
  
  // Get Salary Setting
  const [salaryRows] = await pool.query("SELECT value FROM settings WHERE \`key\` = 'monthly_salary'");
  const salary = salaryRows.length ? parseFloat(salaryRows[0].value) : 0;
  
  const totalIncome = salary + Number(income);
  
  res.json({
    salary,
    extra_income: Number(income),
    total_income: totalIncome,
    total_expense: Number(expense),
    balance: totalIncome - Number(expense)
  });
}));

module.exports = router;

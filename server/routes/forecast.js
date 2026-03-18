const express = require('express');
const { pool } = require('../db');
const { asyncHandler } = require('../middleware/error');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const forecasts = {};
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  // 1. END-OF-MONTH BALANCE PROJECTION
  const [[dailyVelocity]] = await pool.query(`
    SELECT AVG(monthly_expense) / 30 as daily_avg
    FROM (
      SELECT SUM(amount) as monthly_expense
      FROM transactions
      WHERE type = 'expense'
        AND date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 3 MONTH), '%Y-%m-01')
        AND date < DATE_FORMAT(NOW(), '%Y-%m-01')
      GROUP BY DATE_FORMAT(date, '%Y-%m')
    ) sub
  `);

  const [[currentSpend]] = await pool.query(
    "SELECT SUM(amount) as spent FROM transactions WHERE type = 'expense' AND DATE_FORMAT(date, '%Y-%m') = ?",
    [currentMonth]
  );
  const [[currentIncome]] = await pool.query(
    "SELECT SUM(amount) as earned FROM transactions WHERE type = 'income' AND DATE_FORMAT(date, '%Y-%m') = ?",
    [currentMonth]
  );

  const projectedTotalSpend = (currentSpend?.spent || 0) + (dailyVelocity?.daily_avg || 0) * daysRemaining;
  const projectedBalance = (currentIncome?.earned || 0) - projectedTotalSpend;

  let confidence = 'low';
  if (dayOfMonth > 20) confidence = 'high';
  else if (dayOfMonth > 10) confidence = 'medium';

  forecasts.endOfMonth = {
    type: 'end_of_month_projection',
    projectedBalance: Math.round(projectedBalance),
    projectedSpend: Math.round(projectedTotalSpend),
    currentSpend: currentSpend?.spent || 0,
    daysRemaining, confidence,
    explanation: `Based on your 3-month average daily spending of ₦${(dailyVelocity?.daily_avg || 0).toFixed(2)}, you are projected to spend ₦${Math.round(projectedTotalSpend)} total this month.`,
    assumptions: [`You will spend ₦${(dailyVelocity?.daily_avg || 0).toFixed(2)}/day for the remaining ${daysRemaining} days`, 'Does not account for large planned expenses']
  };

  // 2. BUDGET OVERRUN PROBABILITY
  const [budgetRisks] = await pool.query(`
    SELECT 
      c.name,
      b.amount as budget_limit,
      COALESCE(SUM(t.amount), 0) as spent
    FROM categories c
    JOIN budgets b ON c.id = b.category_id AND b.month_iso = ?
    LEFT JOIN transactions t ON c.id = t.category_id 
      AND DATE_FORMAT(t.date, '%Y-%m') = ? 
      AND t.type = 'expense'
    GROUP BY c.id, c.name, b.amount
    HAVING budget_limit > 0
  `, [currentMonth, currentMonth]);

  const monthProgress = dayOfMonth / daysInMonth;
  const overrunRisks = [];

  for (const cat of budgetRisks) {
    const burnRate = cat.spent / cat.budget_limit;
    const projectedSpend = cat.spent / monthProgress;
    let risk = 'low';
    if (burnRate > monthProgress + 0.20) risk = 'high';
    else if (burnRate > monthProgress + 0.05) risk = 'medium';
    if (risk !== 'low') {
      overrunRisks.push({
        category: cat.name, risk,
        spent: cat.spent, budget: cat.budget_limit,
        projectedTotal: Math.round(projectedSpend),
        overageAmount: Math.round(projectedSpend - cat.budget_limit)
      });
    }
  }

  forecasts.budgetRisks = {
    type: 'budget_overrun_probability',
    categories: overrunRisks,
    explanation: 'Compares % of month elapsed to % of budget used.',
    assumptions: ['Spending is linear (not lumpy)']
  };

  // 3. SAVINGS GOAL ETA
  const [goals] = await pool.query("SELECT * FROM goals WHERE is_completed = 0");

  const [[monthlySurplus]] = await pool.query(`
    SELECT AVG(surplus) as avg_surplus
    FROM (
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as surplus
      FROM transactions
      WHERE date >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 3 MONTH), '%Y-%m-01')
      GROUP BY month
    ) sub
  `);

  const goalETAs = goals.map(g => {
    const remaining = g.target_amount - (g.saved_amount || 0);
    const surplus = monthlySurplus?.avg_surplus || 0;
    let eta = null, feasibility = 'impossible';
    if (surplus > 0) {
      const monthsNeeded = remaining / surplus;
      eta = new Date();
      eta.setMonth(eta.getMonth() + Math.ceil(monthsNeeded));
      if (monthsNeeded < 1) feasibility = 'excellent';
      else if (monthsNeeded < 6) feasibility = 'good';
      else if (monthsNeeded < 12) feasibility = 'moderate';
      else feasibility = 'challenging';
    }
    return {
      goalId: g.id, name: g.name, remaining,
      monthsNeeded: surplus > 0 ? Math.ceil(remaining / surplus) : null,
      eta: eta ? eta.toISOString().slice(0, 10) : 'N/A',
      feasibility, requiredMonthly: Math.round(remaining / 1)
    };
  });

  forecasts.goalETAs = {
    type: 'savings_goal_eta', goals: goalETAs,
    monthlySurplus: Math.round(monthlySurplus?.avg_surplus || 0),
    explanation: `Based on your 3-month average surplus of ₦${Math.round(monthlySurplus?.avg_surplus || 0)}/month`,
    assumptions: ['100% of surplus goes to goals (optimistic)']
  };

  // 4. 3-MONTH OUTLOOK
  const drift = (monthlySurplus?.avg_surplus || 0) * 3;
  forecasts.outlook = {
    type: 'three_month_outlook',
    projectedChange: Math.round(drift),
    direction: drift > 0 ? 'positive' : 'negative',
    message: drift > 0
      ? `If you maintain current habits, you will save ₦${Math.round(drift)} over the next 3 months.`
      : `If you maintain current habits, you will lose ₦${Math.abs(Math.round(drift))} over the next 3 months.`,
    confidence: 'medium',
    explanation: 'Based on the last 3 months of income minus expenses',
    assumptions: ['Income and expenses remain stable']
  };

  res.json(forecasts);
}));

module.exports = router;

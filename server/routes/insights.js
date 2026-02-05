const express = require('express');
const { db } = require('../db');
const { asyncHandler } = require('../middleware/error');
const router = express.Router();

/**
 * AI V2: Insights Engine
 * Implements: Pulse Engine, Forecasting, Goal Analysis
 * Design Docs: INSIGHTS_ENGINE_SPEC.md, DATA_ANALYSIS_PLAN.md
 */

router.get('/', asyncHandler(async (req, res) => {
  const insights = [];
  const currentMonth = new Date().toISOString().slice(0, 7);
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  // ============================================================
  // 1. PULSE ENGINE: Spending Spike Detection
  // ============================================================
  // Compare current month pacing to 3-month baseline
  
  const baseline = db.prepare(`
    SELECT 
      category_id,
      AVG(monthly_total) as avg_spend,
      MAX(monthly_total) as max_spend
    FROM (
      SELECT 
        category_id,
        strftime('%Y-%m', date) as month,
        SUM(amount) as monthly_total
      FROM transactions
      WHERE type = 'expense'
        AND date >= date('now', '-4 months', 'start of month')
        AND date < date('now', 'start of month')
      GROUP BY category_id, month
    )
    GROUP BY category_id
    HAVING COUNT(*) >= 2
  `).all();

  const currentPace = db.prepare(`
    SELECT category_id, SUM(amount) as current_spend
    FROM transactions
    WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
    GROUP BY category_id
  `).all(currentMonth);

  const baselineMap = Object.fromEntries(baseline.map(b => [b.category_id, b]));
  
  for (const current of currentPace) {
    const base = baselineMap[current.category_id];
    if (!base) continue; // Not enough history
    
    const projected = current.current_spend / monthProgress;
    const percentAbove = ((projected - base.avg_spend) / base.avg_spend) * 100;
    
    if (percentAbove > 20 && monthProgress < 0.8) {
      const cat = db.prepare('SELECT name FROM categories WHERE id = ?').get(current.category_id);
      insights.push({
        type: 'risk',
        priority: 1,
        title: `Spending Spike: ${cat?.name || 'Unknown'}`,
        message: `At current pace, you'll spend $${Math.round(projected)} this month. Your 3-month average is $${Math.round(base.avg_spend)} (${Math.round(percentAbove)}% increase).`,
        data: { category_id: current.category_id, projected, baseline: base.avg_spend }
      });
    }
  }

  // ============================================================
  // 2. SUBSCRIPTION CREEP: Recurring Expense Inflation
  // ============================================================
  
  const recurring = db.prepare(`
    SELECT 
      description,
      AVG(amount) as avg_amount,
      MAX(amount) as latest_amount,
      COUNT(*) as frequency
    FROM transactions
    WHERE type = 'expense' AND date >= date('now', '-6 months')
    GROUP BY LOWER(TRIM(description))
    HAVING frequency >= 3
  `).all();

  for (const sub of recurring) {
    const increase = sub.latest_amount - sub.avg_amount;
    const percentChange = (increase / sub.avg_amount) * 100;
    
    if (percentChange > 5 && sub.latest_amount > 10) {
      insights.push({
        type: 'observation',
        priority: 2,
        title: `Subscription Change: ${sub.description}`,
        message: `This recurring charge increased from $${sub.avg_amount.toFixed(2)} to $${sub.latest_amount.toFixed(2)} (+${percentChange.toFixed(0)}%).`,
        data: { description: sub.description, increase }
      });
    }
  }

  // ============================================================
  // 3. LIFESTYLE INFLATION: MoM Trend Analysis
  // ============================================================
  
  const trendData = db.prepare(`
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income
    FROM transactions
    WHERE date >= date('now', '-3 months', 'start of month')
    GROUP BY month
    ORDER BY month DESC
  `).all();

  if (trendData.length >= 2) {
    const thisMonth = trendData[0];
    const lastMonth = trendData[1];
    
    const expenseChange = ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100;
    
    if (expenseChange > 10 && thisMonth.income <= lastMonth.income * 1.05) {
      insights.push({
        type: 'trend',
        priority: 2,
        title: 'Lifestyle Inflation Detected',
        message: `Expenses increased ${expenseChange.toFixed(0)}% from last month ($${Math.round(lastMonth.expenses)} → $${Math.round(thisMonth.expenses)}), while income remained stable.`,
        data: { expenseChange, currentExpense: thisMonth.expenses }
      });
    }
  }

  // ============================================================
  // 4. GOAL FEASIBILITY: Conflict Detection
  // ============================================================
  
  const goals = db.prepare(`
    SELECT * FROM goals 
    WHERE is_completed = 0 AND deadline IS NOT NULL
  `).all();

  // Calculate available surplus
  const recentSurplus = db.prepare(`
    SELECT 
      AVG(monthly_surplus) as avg_surplus
    FROM (
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as monthly_surplus
      FROM transactions
      WHERE date >= date('now', '-3 months', 'start of month')
      GROUP BY month
    )
  `).get();

  const availableSurplus = recentSurplus?.avg_surplus || 0;
  let totalDemand = 0;

  for (const goal of goals) {
    const remaining = goal.target_amount - (goal.saved_amount || 0);
    const daysLeft = (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    const monthsLeft = Math.max(daysLeft / 30, 0.5);
    const requiredMonthly = remaining / monthsLeft;
    
    totalDemand += requiredMonthly;
    
    // Individual goal risk
    if (daysLeft < 30 && remaining > availableSurplus * 0.5) {
      insights.push({
        type: 'risk',
        priority: 1,
        title: `Goal at Risk: ${goal.name}`,
        message: `Deadline is in ${Math.ceil(daysLeft)} days. You need $${Math.round(requiredMonthly)}/month, but recent surplus is $${Math.round(availableSurplus)}/month.`,
        data: { goal_id: goal.id, shortfall: requiredMonthly - availableSurplus }
      });
    }
  }

  // Overall goal conflict
  if (totalDemand > availableSurplus * 1.2 && goals.length > 1) {
    insights.push({
      type: 'risk',
      priority: 2,
      title: 'Goal Conflict Detected',
      message: `Your active goals require $${Math.round(totalDemand)}/month, but your average surplus is $${Math.round(availableSurplus)}/month. Consider adjusting deadlines or priorities.`,
      data: { demand: totalDemand, supply: availableSurplus, ratio: totalDemand / availableSurplus }
    });
  }

  // ============================================================
  // 5. OPPORTUNITY: Lazy Money
  // ============================================================
  
  if (availableSurplus > 200 && goals.length > 0) {
    const activeGoal = goals[0]; // Assume first is highest priority
    insights.push({
      type: 'opportunity',
      priority: 3,
      title: 'Surplus Available',
      message: `You have an average surplus of $${Math.round(availableSurplus)}/month. Consider allocating extra to "${activeGoal.name}" to accelerate progress.`,
      data: { surplus: availableSurplus }
    });
  }

  // ============================================================
  // 6. CELEBRATION: Positive Wins
  // ============================================================
  
  const todaySavings = db.prepare(`
    SELECT SUM(amount) as saved FROM transactions 
    WHERE type = 'transfer' AND date = date('now')
  `).get();

  if (todaySavings?.saved > 0) {
    insights.push({
      type: 'success',
      priority: 0,
      title: 'Progress Made! 🎯',
      message: `You contributed $${todaySavings.saved.toFixed(2)} to your goals today.`,
      data: { amount: todaySavings.saved }
    });
  }

  // Sort by priority (0=Highest)
  res.json(insights.sort((a, b) => a.priority - b.priority));
}));

module.exports = router;

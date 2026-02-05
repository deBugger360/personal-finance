const express = require('express');
const { db } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const insights = [];

  // 1. PACING ANALYZER (Am I spending too fast?)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dayOfMonth = new Date().getDate();
  const monthProgress = dayOfMonth / daysInMonth;

  if (monthProgress < 0.9) { // Don't nag at end of month
    const pacingStmt = db.prepare(`
      SELECT 
        c.name,
        b.amount as limit_amount,
        SUM(t.amount) as spent 
      FROM categories c
      JOIN budgets b ON c.id = b.category_id AND b.month_iso = ?
      JOIN transactions t ON c.id = t.category_id AND strftime('%Y-%m', t.date) = ?
      WHERE t.type = 'expense'
      GROUP BY c.id
    `);
    
    const pacingData = pacingStmt.all(currentMonth, currentMonth);

    for (const cat of pacingData) {
      if (cat.limit_amount > 0) {
        const burnRate = cat.spent / cat.limit_amount;
        if (burnRate > monthProgress + 0.25) { // 25% faster than time
             insights.push({
               type: 'warning',
               title: `Pacing Alert: ${cat.name}`,
               message: `You've used ${Math.round(burnRate*100)}% of your budget, but the month is only ${Math.round(monthProgress*100)}% done.`,
               priority: 1
             });
        }
      }
    }
  }

  // 2. SAVINGS COACH (Can I hit my deadline?)
  const goalsStmt = db.prepare(`SELECT * FROM goals WHERE is_completed = 0 AND deadline IS NOT NULL`);
  const goals = goalsStmt.all();

  for (const g of goals) {
    if (g.current_balance && g.deadline) {
       // We need to calculate savings velocity (average per month)
       // For MVP, we'll check if last deposit created a valid trend
       // This is a placeholder for complex trend analysis
       
       // Simple check: Is deadline mathematically hitting?
       const daysLeft = (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24);
       if (daysLeft < 30 && g.current_balance < g.target_amount * 0.9) {
          insights.push({
             type: 'alert',
             title: `Goal at Risk: ${g.name}`,
             message: `Deadline is in ${Math.ceil(daysLeft)} days and you are ${Math.ceil(g.target_amount - g.current_balance)} short.`,
             priority: 2
          });
       }
    }
  }

  // 3. WIN CELEBRATOR (Did I do something good?)
  const lastTrans = db.prepare("SELECT * FROM transactions WHERE type='transfer' AND date = date('now')").get();
  if (lastTrans) {
    insights.push({
      type: 'success',
      title: 'Great job saving! 🚀',
      message: 'You funded a goal today. Keep this momentum up!',
      priority: 0
    });
  }

  // Sort by priority (0=High, 9=Low)
  res.json(insights.sort((a,b) => a.priority - b.priority));
});

module.exports = router;

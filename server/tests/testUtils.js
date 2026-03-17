const { db } = require('../db');

function clearDatabase() {
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM transactions;');
  db.exec('DELETE FROM budgets;');
  db.exec('DELETE FROM goals;');
  db.exec('DELETE FROM categories;');
  db.exec('DELETE FROM settings;');
  db.exec('PRAGMA foreign_keys = ON;');
}

function seedCategories() {
  const insert = db.prepare('INSERT INTO categories (id, name, type, icon) VALUES (?, ?, ?, ?)');
  const defaults = [
    [1, 'Salary', 'income', '💰'],
    [2, 'Groceries', 'expense', '🛒'],
    [3, 'Rent/Mortgage', 'expense', '🏠'],
    [4, 'Savings', 'savings', '🏦'],
    [5, 'Shopping', 'expense', '🛍️'],
    [6, 'Entertainment', 'expense', '🎬']
  ];
  db.transaction((cats) => {
    for (const cat of cats) insert.run(cat);
  })(defaults);
}

function seedTransactions(transactions) {
  const insert = db.prepare('INSERT INTO transactions (date, amount, description, category_id, goal_id, type) VALUES (?, ?, ?, ?, ?, ?)');
  db.transaction((txs) => {
    for (const tx of txs) {
      insert.run(tx.date, tx.amount, tx.description, tx.category_id, tx.goal_id || null, tx.type);
    }
  })(transactions);
}

function seedGoals(goals) {
    const insert = db.prepare('INSERT INTO goals (id, name, target_amount, saved_amount, deadline, priority, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?)');
    db.transaction((items) => {
        for (const item of items) {
           insert.run(item.id, item.name, item.target_amount, item.saved_amount || 0, item.deadline || null, item.priority || 2, item.is_completed || 0);
        }
    })(goals);
}

function seedBudgets(budgets) {
    const insert = db.prepare('INSERT INTO budgets (category_id, month_iso, amount) VALUES (?, ?, ?)');
    db.transaction((items) => {
        for (const item of items) {
            insert.run(item.category_id, item.month_iso, item.amount);
        }
    })(budgets);
}

module.exports = {
  clearDatabase,
  seedCategories,
  seedTransactions,
  seedGoals,
  seedBudgets
};

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './Home';
import { AddExpenseView } from './features/transactions/AddExpenseView';
import { LedgerView } from './features/transactions/LedgerView';
import { SettingsPage } from './features/settings/SettingsPage';
import { BudgetView } from './features/budgets/BudgetView';
import { GoalsView } from './features/goals/GoalsView';
import { InsightsPage } from './features/insights/InsightsPage';
import { ForecastPage } from './features/forecast/ForecastPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="add" element={<AddExpenseView />} />
            <Route path="transactions" element={<LedgerView />} />
            <Route path="budgets" element={<BudgetView />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="goals" element={<GoalsView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

import React from 'react';
import { formatMoney } from '../../lib/utils';

export function DashboardView({ summary }) {
    if (!summary) return null;

    return (
        <div className="stats-row">
            <div className="stat-card">
                <div className="stat-label">Income (Total)</div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>
                    {formatMoney(summary.total_income)}
                </div>
                <small className="text-muted">Salary: {formatMoney(summary.salary)}</small>
            </div>
            <div className="stat-card">
                <div className="stat-label">Expenses</div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>
                    {formatMoney(summary.total_expense)}
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-label">Balance</div>
                <div className="stat-value" style={{ color: summary.balance >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    {formatMoney(summary.balance)}
                </div>
            </div>
        </div>
    );
}

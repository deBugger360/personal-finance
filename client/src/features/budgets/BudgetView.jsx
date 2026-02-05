import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import { Settings } from 'lucide-react';

export function BudgetView() {
    const [budgets, setBudgets] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const currentMonth = new Date().toISOString().slice(0, 7);

    const fetchBudgets = () => {
        fetch(`${API_URL}/budgets/status?month=${currentMonth}`)
            .then(res => res.json())
            .then(setBudgets);
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleEdit = (b) => {
        setEditingId(b.id);
        setEditAmount(b.budget_limit || '');
    };

    const handleSave = async (category_id) => {
        await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category_id,
                month: currentMonth,
                amount: Number(editAmount)
            })
        });
        setEditingId(null);
        fetchBudgets();
    };

    // Time Awareness: Days remaining
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const daysLeft = daysInMonth - dayOfMonth;
    const monthProgress = dayOfMonth / daysInMonth;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Spending Plan</h2>
                <small className="text-muted">{daysLeft} days left in month</small>
            </div>

            <div className="glass card" style={{ padding: 0, marginTop: '1rem', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {budgets.map(b => {
                            const percentSqent = b.budget_limit > 0 ? (b.spent / b.budget_limit) : 0;
                            const isOver = b.remaining < 0;
                            const isWarning = !isOver && percentSqent > 0.8;

                            // "Pacing" logic: If we are 50% through month but 80% spent, that's bad.
                            const pacingBad = (percentSqent > monthProgress + 0.1) && b.budget_limit > 0;

                            return (
                                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', width: '50px', fontSize: '1.2rem' }}>{b.icon}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{b.name}</div>

                                        {/* Progress Bar */}
                                        {b.has_budget === 1 && (
                                            <div style={{
                                                height: '4px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '2px',
                                                marginTop: '6px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${Math.min(percentSqent * 100, 100)}%`,
                                                    background: isOver ? 'var(--danger)' : (isWarning || pacingBad ? 'var(--warning)' : 'var(--success)')
                                                }} />
                                            </div>
                                        )}
                                    </td>

                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        {editingId === b.id ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={e => setEditAmount(e.target.value)}
                                                    autoFocus
                                                    style={{ width: '80px', padding: '4px' }}
                                                />
                                                <button onClick={() => handleSave(b.id)} className="btn-primary" style={{ padding: '4px 8px' }}>✓</button>
                                            </div>
                                        ) : (
                                            <div onClick={() => handleEdit(b)} style={{ cursor: 'pointer' }}>
                                                {b.has_budget ? (
                                                    <>
                                                        <div style={{ fontWeight: 'bold', color: isOver ? 'var(--danger)' : 'var(--text-main)' }}>
                                                            {formatMoney(b.remaining)} left
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            of {formatMoney(b.budget_limit)}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                                        Set Limit <Settings size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { formatMoney } from '../../lib/utils';
import { AddTransactionForm } from './AddTransactionForm';

export function TransactionList({ transactions, categories, onRefresh }) {
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="glass card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Transactions</h2>
                {!showAdd && <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add</button>}
            </div>

            {showAdd && (
                <AddTransactionForm
                    categories={categories}
                    onSave={() => { setShowAdd(false); onRefresh(); }}
                    onCancel={() => setShowAdd(false)}
                />
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Date</th>
                        <th style={{ padding: '1rem' }}>Category</th>
                        <th style={{ padding: '1rem' }}>Description</th>
                        <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem' }}>{t.date}</td>
                            <td style={{ padding: '1rem' }}>{t.category_icon} {t.category_name}</td>
                            <td style={{ padding: '1rem' }}>{t.description}</td>
                            <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' }}>
                                {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No transactions yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

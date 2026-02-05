import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';

export function LedgerView() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/transactions`)
            .then(res => res.json())
            .then(data => {
                setTransactions(data);
                setLoading(false);
            });
    }, []);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in">
            <h2>Transaction Ledger</h2>
            <div className="glass card" style={{ marginTop: '1rem', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', width: '100px' }}>{t.date}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{t.category_icon} {t.category_name}</div>
                                    {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' }}>
                                    {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

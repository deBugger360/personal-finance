import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Trash2 } from 'lucide-react';

export function LedgerView() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = () => {
        api.get('/transactions')
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await api.del(`/transactions/${id}`);
                fetchTransactions(); // Refresh list to reflect correct totals
            } catch (err) {
                alert('Failed to delete transaction');
            }
        }
    };

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
                            <th style={{ padding: '1rem', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', width: '120px' }}>{t.date}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div>{t.category_icon || '📦'} {t.category_name || 'Unknown'}</div>
                                    {t.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description}</div>}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' }}>
                                    {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', opacity: 0.5 }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

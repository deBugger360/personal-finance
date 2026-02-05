import React, { useState, useEffect } from 'react';
import { API_URL } from './lib/api';
import { DashboardView } from './features/dashboard/DashboardView';
import { InsightCard } from './features/insights/InsightCard';
import { TransactionList } from './features/transactions/TransactionList';
import { useNavigate } from 'react-router-dom';

export function Home() {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const refreshData = async () => {
        try {
            const [sumRes, transRes, catsRes] = await Promise.all([
                fetch(`${API_URL}/summary?month=${new Date().toISOString().slice(0, 7)}`),
                fetch(`${API_URL}/transactions`),
                fetch(`${API_URL}/categories`)
            ]);

            const sumData = await sumRes.json();
            const transData = await transRes.json();
            const catsData = await catsRes.json();

            setSummary(sumData);
            setTransactions(transData.slice(0, 3)); // Only show top 3 on home
            setCategories(catsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Hello, Chief</h1>

            {/* Pulse Dashboard */}
            <InsightCard />
            <DashboardView summary={summary} />

            {/* Recent Activity Preview */}
            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Activity</span>
                <button
                    onClick={() => navigate('/transactions')}
                    style={{ background: 'none', color: 'var(--primary)', fontSize: '0.9rem' }}
                >
                    See All
                </button>
            </h3>

            <div className="glass card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '1.2rem' }}>{t.category_icon}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: 500 }}>{t.category_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.description || t.date}</div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: t.type === 'income' ? 'var(--success)' : 'var(--text-main)' }}>
                                    {t.type === 'expense' ? '-' : '+'}{Number(t.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr><td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No activity yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

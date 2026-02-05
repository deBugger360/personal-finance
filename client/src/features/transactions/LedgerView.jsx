import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Trash2, Upload } from 'lucide-react';

export function LedgerView() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const fileRef = useRef(null);

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
                fetchTransactions();
            } catch (err) {
                alert('Failed to delete transaction');
            }
        }
    };

    const handleImportClick = () => fileRef.current.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // MVP: Assume simple CSV format: date,amount,description
        // Defaulting all to 'expense' and category 'Others' (id: 1 presumably, or we map it)
        // For verify step: We will just try to parse a specific simple format.

        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        // Skip header if present (heuristic: first line contains 'date')
        const startIdx = lines[0].toLowerCase().includes('date') ? 1 : 0;

        const newTrans = [];

        for (let i = startIdx; i < lines.length; i++) {
            // Very naive split, doesn't handle commas in quotes. MVP.
            const cols = lines[i].split(',');
            if (cols.length >= 3) {
                const date = cols[0].trim();
                const amount = parseFloat(cols[1].trim());
                const desc = cols[2].trim();

                if (date && !isNaN(amount)) {
                    newTrans.push({
                        date,
                        amount: Math.abs(amount), // Import as positive for amount
                        type: 'expense', // Forced as per prompt scope
                        description: desc,
                        category_id: 1 // Default category (usually a fallback)
                    });
                }
            }
        }

        if (newTrans.length > 0) {
            setImporting(true);
            try {
                await api.post('/transactions/batch', newTrans);
                alert(`Successfully imported ${newTrans.length} transactions!`);
                fetchTransactions();
            } catch (err) {
                alert('Import failed: ' + err.message);
            } finally {
                setImporting(false);
                e.target.value = null; // Reset input
            }
        } else {
            alert("No valid transactions found. Format: Date,Amount,Description");
            e.target.value = null;
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Transaction Ledger</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="file"
                        ref={fileRef}
                        style={{ display: 'none' }}
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={handleImportClick}
                        className="btn-secondary"
                        disabled={importing}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                        <Upload size={16} /> {importing ? 'Importing...' : 'Import CSV'}
                    </button>
                </div>
            </div>

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

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export function AddExpenseView() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState('');
    const [selectedCat, setSelectedCat] = useState(null);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetch(`${API_URL}/categories`)
            .then(res => res.json())
            .then(data => setCategories(data.filter(c => c.type === 'expense')));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCat || !amount) return;

        await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date,
                amount,
                description,
                category_id: selectedCat,
                type: 'expense'
            })
        });
        navigate('/');
    };

    return (
        <div className="animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem' }}>Log Expense</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                        style={{ fontSize: '3rem', padding: '1rem', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', borderRadius: 0, color: 'var(--text-main)' }}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-muted)' }}>Select Category</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: selectedCat === cat.id ? 'var(--primary)' : 'var(--bg-surface)',
                                    border: selectedCat === cat.id ? 'none' : '1px solid var(--border-color)',
                                    transition: 'all 0.2s',
                                    transform: selectedCat === cat.id ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{cat.icon}</span>
                                <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass card" style={{ padding: '1rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Note (Optional)</label>
                        <input type="text" placeholder="What is this for?" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.2rem', marginTop: '1rem' }}
                    disabled={!amount || !selectedCat}
                >
                    Save Transaction
                </button>
            </form>
        </div>
    );
}

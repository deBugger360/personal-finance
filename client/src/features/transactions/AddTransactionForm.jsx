import React, { useState } from 'react';
import { API_URL } from '../../lib/api';

export function AddTransactionForm({ categories, onSave, onCancel }) {
    const [newTrans, setNewTrans] = useState({
        amount: '',
        description: '',
        category_id: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTrans)
        });
        setNewTrans({ ...newTrans, amount: '', description: '' });
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <div className="grid-2">
                <input
                    type="date"
                    value={newTrans.date}
                    onChange={e => setNewTrans({ ...newTrans, date: e.target.value })}
                    required
                />
                <select
                    value={newTrans.type}
                    onChange={e => setNewTrans({ ...newTrans, type: e.target.value })}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income (Extra)</option>
                </select>
                <select
                    value={newTrans.category_id}
                    onChange={e => setNewTrans({ ...newTrans, category_id: e.target.value })}
                    required
                >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.type === (newTrans.type === 'income' ? 'income' : 'expense')).map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    step="0.01"
                    value={newTrans.amount}
                    onChange={e => setNewTrans({ ...newTrans, amount: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={newTrans.description}
                    onChange={e => setNewTrans({ ...newTrans, description: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                    <button type="button" onClick={onCancel} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '8px', padding: '0 1rem' }}>Cancel</button>
                </div>
            </div>
        </form>
    );
}

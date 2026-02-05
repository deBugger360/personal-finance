import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';

export function SettingsPage() {
    const [salary, setSalary] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSalary(data.monthly_salary || ''));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ salary })
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="animate-fade-in">
            <h2>Settings</h2>

            <div className="glass card" style={{ marginTop: '1rem' }}>
                <h3>Base Budgeting</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Setting a fixed monthly salary helps the app calculate your "Safe to Spend" amount instantly.
                </p>

                <form onSubmit={handleSave}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Monthly Take-home Pay</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={e => setSalary(e.target.value)}
                            placeholder="e.g. 5000"
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        {saved ? 'Saved!' : 'Update Salary'}
                    </button>
                </form>
            </div>

            <div className="glass card" style={{ marginTop: '1rem', opacity: 0.7 }}>
                <h3>Data Management</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    To reset your data, you can currently delete the <code>finance.db</code> file in the project folder.
                    Export/Import features coming soon.
                </p>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';

export function SettingsView({ initialSalary, onSave, onClose }) {
    const [salaryInput, setSalaryInput] = useState(initialSalary || '');

    // Update local state if prop changes (e.g. initial load)
    useEffect(() => {
        setSalaryInput(initialSalary);
    }, [initialSalary]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ salary: salaryInput })
        });
        onSave();
        onClose();
    };

    return (
        <div className="glass card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Settings</h3>
                <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="grid-2">
                <div>
                    <label>Monthly Fixed Salary</label>
                    <input
                        type="number"
                        value={salaryInput}
                        onChange={e => setSalaryInput(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn-primary">Save Salary</button>
                </div>
            </form>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../../lib/api';
import { Download, FileText } from 'lucide-react';

export function SettingsView({ initialSalary, onSave, onClose }) {
    const [salaryInput, setSalaryInput] = useState(initialSalary || '');

    // Update local state if prop changes (e.g. initial load)
    useEffect(() => {
        setSalaryInput(initialSalary);
    }, [initialSalary]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/settings', { salary: salaryInput });
        onSave();
        onClose();
    };

    const handleExportJson = () => {
        window.open(`${API_URL}/data/export`, '_blank');
    };

    const handleExportCsv = () => {
        window.open(`${API_URL}/data/export?format=csv`, '_blank');
    };

    return (
        <div className="glass card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Settings</h3>
                <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="grid-2" style={{ marginBottom: '2rem' }}>
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

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Data Ownership</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={handleExportJson} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Backup Data (JSON)
                    </button>
                    <button onClick={handleExportCsv} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} /> Export Transactions (CSV)
                    </button>
                </div>
                <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Download your data anytime. No lock-in. JSON contains strictly everything; CSV is for spreadsheet analysis.
                </p>
            </div>
        </div>
    );
}

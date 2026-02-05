import React, { useState, useEffect, useRef } from 'react';
import { api, API_URL } from '../../lib/api';
import { Download, FileText, Upload, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
    const [salary, setSalary] = useState('');
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        api.get('/settings')
            .then(data => setSalary(data.monthly_salary || ''))
            .catch(console.error);
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await api.post('/settings', { salary });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExportJson = () => {
        window.open(`${API_URL}/data/export`, '_blank');
    };

    const handleExportCsv = () => {
        window.open(`${API_URL}/data/export?format=csv`, '_blank');
    };

    const handleRestoreClick = () => {
        if (window.confirm("⚠️ DANGER ZONE ⚠️\n\nRestoring a backup will ERASE all current data and replace it with the backup file.\n\nThis action cannot be undone.\n\nAre you sure you want to proceed?")) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);

                // Simple validation
                if (!json.meta || json.meta.app !== 'personal-finance-local') {
                    throw new Error("Invalid backup file. Missing metadata.");
                }

                await api.post('/data/import', json);
                alert("Restore Successful!\n\nThe page will now reload.");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert("Restore Failed: " + err.message);
            }
        };
        reader.readAsText(file);

        // Reset input
        e.target.value = null;
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

            <div className="glass card" style={{ marginTop: '1rem' }}>
                <h3>Data Ownership</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Your data is yours. Export or restore it anytime.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <button onClick={handleExportJson} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Backup Data (JSON)
                    </button>
                    <button onClick={handleExportCsv} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} /> Export Transactions (CSV)
                    </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} /> Danger Zone
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Restoring from a backup will replace all current data.
                    </p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept=".json"
                        onChange={handleFileChange}
                    />
                    <button onClick={handleRestoreClick} className="btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                        <Upload size={16} style={{ marginRight: '0.5rem' }} /> Restore from Backup
                    </button>
                </div>
            </div>
        </div>
    );
}

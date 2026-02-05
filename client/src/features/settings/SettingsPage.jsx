import React, { useState, useEffect, useRef } from 'react';
import { api, API_URL } from '../../lib/api';
import { Download, FileText, Upload, AlertTriangle, Save, Briefcase, Database } from 'lucide-react';

export function SettingsPage() {
    const [salary, setSalary] = useState('');
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        document.title = 'Settings - FinanceApp';
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
        e.target.value = null;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-2">Manage your preferences and data.</p>
            </header>

            <div className="grid gap-8">
                {/* Base Budgeting / Salary */}
                <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Base Budgeting</h2>
                            <p className="text-sm text-gray-500">Fixed monthly income for "Safe to Spend" calculations.</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Take-home Pay</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={salary}
                                        onChange={e => setSalary(e.target.value)}
                                        placeholder="e.g. 5000"
                                        className="pl-7 block w-full rounded-lg border-gray-300 border bg-gray-50 focus:bg-white focus:ring-green-500 focus:border-green-500 py-2.5 transition-colors"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className={`
                                    px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all flex items-center gap-2
                                    ${saved ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}
                                `}
                            >
                                <Save size={18} />
                                {saved ? 'Saved!' : 'Update Salary'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Data Management */}
                <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Data Management</h2>
                            <p className="text-sm text-gray-500">Export your data or restore from a backup.</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <button
                                onClick={handleExportJson}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 group"
                            >
                                <Download size={18} className="text-gray-400 group-hover:text-gray-600" />
                                Backup Data (JSON)
                            </button>
                            <button
                                onClick={handleExportCsv}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 group"
                            >
                                <FileText size={18} className="text-gray-400 group-hover:text-gray-600" />
                                Export Transactions (CSV)
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                            <div className="flex items-start gap-4">
                                <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-red-700 text-base">Danger Zone</h4>
                                    <p className="text-sm text-red-600 mt-1 mb-4">
                                        Restoring from a backup will <strong>permanently replace</strong> all current data.
                                    </p>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        accept=".json"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={handleRestoreClick}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2"
                                    >
                                        <Upload size={16} />
                                        Restore from Backup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

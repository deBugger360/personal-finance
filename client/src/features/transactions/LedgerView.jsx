import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { Trash2, Upload, FileText, Search, Filter, DollarSign, TrendingDown, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function LedgerView() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const fileRef = useRef(null);

    const fetchTransactions = () => {
        setLoading(true);
        api.get('/transactions')
            .then(data => {
                setTransactions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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

        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const startIdx = lines[0].toLowerCase().includes('date') ? 1 : 0;

        const newTrans = [];

        for (let i = startIdx; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 3) {
                const date = cols[0].trim();
                const amount = parseFloat(cols[1].trim());
                const desc = cols[2].trim();

                if (date && !isNaN(amount)) {
                    newTrans.push({
                        date,
                        amount: Math.abs(amount),
                        type: 'expense', // Defaulting to expense for CSV import MVP
                        category_id: 1,  // Default 'Others'
                        description: desc
                    });
                }
            }
        }

        if (newTrans.length > 0) {
            for (const t of newTrans) {
                await api.post('/transactions', t);
            }
            fetchTransactions();
            alert(`Imported ${newTrans.length} transactions`);
        } else {
            alert('No valid transactions found in CSV');
        }
    };

    // Filter transactions
    const filteredTransactions = transactions.filter(t =>
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helpers for icons
    const getCategoryIcon = (iconName) => {
        const iconMap = {
            'DollarSign': DollarSign,
            'TrendingDown': TrendingDown,
            'Wallet': Wallet,
        };
        const Icon = iconMap[iconName] || DollarSign;
        return <Icon size={16} strokeWidth={2} />;
    };

    return (
        <div className="max-w-full px-4 md:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction Ledger</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your financial activity</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".csv"
                    />
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm"
                    >
                        <Upload size={18} />
                        <span>Import CSV</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <FileText className="text-gray-400" size={24} />
                                            </div>
                                            <p className="text-gray-500 font-medium">No transactions found</p>
                                            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or import a CSV</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {t.date}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {t.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {/* Use generic icon if none provided */}
                                                {getCategoryIcon(t.category_icon_name)}
                                                {t.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                                            <div className={`flex items-center justify-end gap-1 ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                                                {t.type === 'income' ? <ArrowDownLeft size={16} /> : null}
                                                {t.type === 'expense' ? '-' : '+'}
                                                ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                                title="Delete Transaction"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

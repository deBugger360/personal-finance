import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import { Settings, TrendingUp, Plus } from 'lucide-react';

export function BudgetView() {
    const [budgets, setBudgets] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const currentMonth = new Date().toISOString().slice(0, 7);

    const fetchBudgets = () => {
        fetch(`${API_URL}/budgets/status?month=${currentMonth}`)
            .then(res => res.json())
            .then(setBudgets);
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleEdit = (b) => {
        setEditingId(b.id);
        setEditAmount(b.budget_limit || '');
    };

    const handleSave = async (category_id) => {
        await fetch(`${API_URL}/budgets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category_id,
                month: currentMonth,
                amount: Number(editAmount)
            })
        });
        setEditingId(null);
        fetchBudgets();
    };

    // Time Awareness: Days remaining
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const daysLeft = daysInMonth - dayOfMonth;
    const monthProgress = dayOfMonth / daysInMonth;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Spending Plan</h1>
                    <p className="text-sm text-gray-600 mt-1">{daysLeft} days left in {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                    <Plus size={20} strokeWidth={2} />
                    <span className="hidden sm:inline">New Category</span>
                </button>
            </div>

            {/* Progress Overview */}
            <div className="bg-green-50 border border-green-200 rounded-card p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-900">Month Progress</span>
                    <span className="text-sm font-semibold text-green-700">{Math.round(monthProgress * 100)}%</span>
                </div>
                <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${monthProgress * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Budgets Table */}
            <div className="bg-white border border-gray-200 rounded-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Progress</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Budget</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {budgets.map(b => {
                                const percentSpent = b.budget_limit > 0 ? (b.spent / b.budget_limit) : 0;
                                const isOver = b.remaining < 0;
                                const isWarning = !isOver && percentSpent > 0.8;
                                const pacingBad = (percentSpent > monthProgress + 0.1) && b.budget_limit > 0;

                                return (
                                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <TrendingUp size={20} className="text-gray-600" strokeWidth={2} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{b.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {b.has_budget ? `${formatMoney(b.spent)} spent` : 'No limit set'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {b.has_budget === 1 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-gray-600">{Math.round(percentSpent * 100)}%</span>
                                                        {pacingBad && <span className="text-xs text-amber-600 font-medium">Off pace</span>}
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${isOver ? 'bg-red-500' :
                                                                    isWarning || pacingBad ? 'bg-amber-500' :
                                                                        'bg-green-500'
                                                                }`}
                                                            style={{ width: `${Math.min(percentSpent * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === b.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={e => setEditAmount(e.target.value)}
                                                        autoFocus
                                                        className="w-24 px-3 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="0.00"
                                                    />
                                                    <button
                                                        onClick={() => handleSave(b.id)}
                                                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => handleEdit(b)}
                                                    className="cursor-pointer group"
                                                >
                                                    {b.has_budget ? (
                                                        <div>
                                                            <div className={`font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {formatMoney(Math.abs(b.remaining))} {isOver ? 'over' : 'left'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                of {formatMoney(b.budget_limit)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors">
                                                            <Settings size={14} strokeWidth={2} />
                                                            Set Limit
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

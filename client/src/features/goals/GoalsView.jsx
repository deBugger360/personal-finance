import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import { Target, Calendar, Plus, Save } from 'lucide-react';

export function GoalsView() {
    const [goals, setGoals] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newGoal, setNewGoal] = useState({ name: '', target_amount: '', deadline: '' });

    const fetchGoals = () => {
        fetch(`${API_URL}/goals`)
            .then(res => res.json())
            .then(setGoals);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGoal)
        });
        setShowAdd(false);
        setNewGoal({ name: '', target_amount: '', deadline: '' });
        fetchGoals();
    };

    const handleFund = async (id) => {
        const amount = prompt("How much do you want to save towards this today?");
        if (amount) {
            await fetch(`${API_URL}/goals/${id}/fund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(amount) })
            });
            fetchGoals();
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
                    <p className="text-sm text-gray-500 mt-1">Track your progress towards major purchases</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showAdd
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                >
                    {showAdd ? 'Cancel' : (
                        <>
                            <Plus size={20} strokeWidth={2} />
                            <span>New Goal</span>
                        </>
                    )}
                </button>
            </div>

            {showAdd && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. New Laptop"
                                    value={newGoal.name}
                                    onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={newGoal.target_amount}
                                    onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date (Optional)</label>
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm"
                            >
                                <Save size={18} />
                                Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(g => {
                    const progress = Math.min((g.current_balance / g.target_amount) * 100, 100);

                    let timeMsg = null;
                    if (g.deadline) {
                        const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        if (daysLeft > 0) {
                            const monthsLeft = daysLeft / 30;
                            const perMonth = (g.target_amount - g.current_balance) / Math.max(monthsLeft, 1);
                            timeMsg = `Save ${formatMoney(Math.max(0, perMonth))} / mo to hit target`;
                        } else {
                            timeMsg = "Target date passed";
                        }
                    } else {
                        // Estimate based on progress if no deadline
                        timeMsg = "Set a date to calculate monthly target";
                    }

                    return (
                        <div key={g.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{g.name}</h3>
                                    {g.deadline && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                            <Calendar size={12} />
                                            {g.deadline}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-gray-900">
                                        {formatMoney(g.current_balance)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        of {formatMoney(g.target_amount)}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-gray-700">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 max-w-[60%]">
                                    {timeMsg}
                                </div>
                                <button
                                    onClick={() => handleFund(g.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-white hover:border-green-300 hover:text-green-600 font-medium text-xs transition-colors"
                                >
                                    <Plus size={14} strokeWidth={2.5} />
                                    Fund
                                </button>
                            </div>
                        </div>
                    );
                })}

                {goals.length === 0 && !showAdd && (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 box-border">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                            <Target size={32} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No goals yet</h3>
                        <p className="text-gray-500 mb-6">Create a savings goal to track your progress</p>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
                        >
                            <Plus size={18} strokeWidth={2} />
                            Create First Goal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

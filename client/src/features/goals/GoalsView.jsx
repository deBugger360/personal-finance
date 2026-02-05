import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { formatMoney } from '../../lib/utils';
import { Target, Calendar, TrendingUp, Plus } from 'lucide-react';

export function GoalsView() {
    const [goals, setGoals] = useState([]);
    const [showAdd, setShowAdd] = useState(false);

    // New Goal Form State
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
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Financial Goals</h2>
                <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? 'Cancel' : '+ New Goal'}
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleCreate} className="glass card animate-fade-in" style={{ marginBottom: '2rem' }}>
                    <div className="grid-2">
                        <input
                            type="text"
                            placeholder="Goal Name (e.g. New Laptop)"
                            value={newGoal.name}
                            onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Target Amount"
                            value={newGoal.target_amount}
                            onChange={e => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                            required
                        />
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deadline (Optional)</label>
                            <input
                                type="date"
                                value={newGoal.deadline}
                                onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ marginTop: 'auto' }}>Create Goal</button>
                    </div>
                </form>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {goals.map(g => {
                    const progress = Math.min((g.current_balance / g.target_amount) * 100, 100);

                    // Time Calculation
                    let timeMsg = null;
                    if (g.deadline) {
                        const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        if (daysLeft > 0) {
                            const monthsLeft = daysLeft / 30;
                            const perMonth = (g.target_amount - g.current_balance) / monthsLeft;
                            timeMsg = `Save ${formatMoney(Math.max(0, perMonth))} / mo to hit target`;
                        } else {
                            timeMsg = "Deadline passed";
                        }
                    }

                    return (
                        <div key={g.id} className="glass card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{g.name}</h3>
                                    {g.deadline && <small style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><Calendar size={12} /> {g.deadline}</small>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--success)' }}>
                                        {formatMoney(g.current_balance)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>of {formatMoney(g.target_amount)}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.5s ease-out' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>{timeMsg}</span>
                                <button
                                    onClick={() => handleFund(g.id)}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid var(--border-color)',
                                        color: 'white',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Plus size={16} /> Fund
                                </button>
                            </div>
                        </div>
                    );
                })}

                {goals.length === 0 && !showAdd && (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                        <Target size={48} />
                        <p>No goals yet. Set a target to start saving.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

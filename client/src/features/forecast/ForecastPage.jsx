import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TrendingUp, Calendar, Target, DollarSign, Info, BarChart2, AlertCircle } from 'lucide-react';

export function ForecastPage() {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/forecast')
            .then(data => {
                setForecast(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-white border border-gray-200 rounded-xl"></div>
                        <div className="h-64 bg-white border border-gray-200 rounded-xl"></div>
                        <div className="h-64 bg-white border border-gray-200 rounded-xl"></div>
                        <div className="h-64 bg-white border border-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Financial Forecast</h1>
                <p className="text-sm text-gray-500 mt-1">
                    AI-driven projections based on your spending habits
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EndOfMonthCard data={forecast?.month_end} />
                <BudgetRiskCard data={forecast?.budget_risk} />
                <GoalETACard data={forecast?.goal_eta} />
                <DriftCard data={forecast?.drift} />
            </div>
        </div>
    );
}

function EndOfMonthCard({ data }) {
    if (!data || data.days_remaining < 3) {
        return <EmptyCard
            icon={<Calendar />}
            title="End-of-Month Projection"
            message="We need at least 3 days of transaction data to generate reliable projections."
            action="Add Transactions"
        />;
    }

    const { projected_balance, confidence, days_remaining, current_balance } = data;
    const isNegative = projected_balance < 0;
    const daysInMonth = days_remaining + (new Date().getDate());
    const progress = ((new Date().getDate()) / daysInMonth) * 100;

    const confidenceColors = {
        high: 'text-green-700 bg-green-50 border-green-200',
        medium: 'text-amber-700 bg-amber-50 border-amber-200',
        low: 'text-gray-700 bg-gray-50 border-gray-200',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 rounded-lg border border-green-100">
                        <TrendingUp className="text-green-600" size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">End-of-Month Projection</h3>
                        <p className="text-xs text-gray-500">Estimated balance</p>
                    </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${confidenceColors[confidence]}`}>
                    {confidence} confidence
                </span>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Projected</p>
                        <p className={`text-3xl font-bold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
                            ${projected_balance.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Current</p>
                        <p className="text-xl font-semibold text-gray-700">${current_balance.toLocaleString()}</p>
                    </div>
                </div>

                <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Today</span>
                    <span>{days_remaining} days left</span>
                </div>
            </div>

            {isNegative && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 leading-snug">
                        You are projected to have a negative balance by end of month based on current spending.
                    </p>
                </div>
            )}
        </div>
    );
}

function BudgetRiskCard({ data }) {
    if (!data || data.length === 0) {
        return <EmptyCard
            icon={<Target />}
            title="Budget Risk Analysis"
            message="No active budgets found. Set spending limits to track risks."
            action="Set Budgets"
        />;
    }

    const highRisk = data.filter(cat => cat.overrun_probability > 0.5)
        .sort((a, b) => b.overrun_probability - a.overrun_probability)
        .slice(0, 3);

    if (highRisk.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                    <Target className="text-green-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">On Track!</h3>
                <p className="text-gray-500">All your category budgets are within safe limits.</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                    <Target className="text-amber-600" size={20} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Budget Risk</h3>
                    <p className="text-xs text-gray-500">Categories requiring attention</p>
                </div>
            </div>

            <div className="space-y-6">
                {highRisk.map((cat, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{cat.category_name}</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                {Math.round(cat.overrun_probability * 100)}% Risk
                            </span>
                        </div>

                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                            <div
                                className={`absolute h-full ${cat.overrun_probability > 0.7 ? 'bg-red-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min((cat.spent / cat.budget) * 100, 100)}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                            <span>${cat.spent} / ${cat.budget}</span>
                            <span>Projected: ${cat.projected_spend}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GoalETACard({ data }) {
    if (!data || data.length === 0) {
        return <EmptyCard
            icon={<Target />}
            title="Goal Progress"
            message="Create savings goals to see estimated completion dates."
            action="Add Goal"
        />;
    }

    const activeGoals = data.slice(0, 3);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Target className="text-blue-600" size={20} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Goal ETA</h3>
                    <p className="text-xs text-gray-500">Timeline for your targets</p>
                </div>
            </div>

            <div className="space-y-6">
                {activeGoals.map((goal, idx) => {
                    const progress = (goal.current_balance / goal.target_amount) * 100;
                    return (
                        <div key={idx}>
                            <div className="flex justify-between mb-2">
                                <span className="font-medium text-gray-900">{goal.goal_name}</span>
                                <span className="text-xs text-gray-500">
                                    {goal.eta_date ? `ETA: ${new Date(goal.eta_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : 'N/A'}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DriftCard({ data }) {
    if (!data || !data.months || data.months.length < 2) {
        return <EmptyCard
            icon={<BarChart2 />}
            title="3-Month Trend"
            message="Not enough historical data to display trends."
            action="N/A"
        />;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
                    <BarChart2 className="text-indigo-600" size={20} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Financial Drift</h3>
                    <p className="text-xs text-gray-500">Net worth momentum</p>
                </div>
            </div>

            <div className="flex items-center justify-center py-6">
                <div className="text-center">
                    <div className={`text-4xl font-bold ${data.slope > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {data.slope > 0 ? '+' : ''}{data.slope}/mo
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Average Monthly Change</p>
                </div>
            </div>
        </div>
    );
}

function EmptyCard({ icon, title, message, action }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px]">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                {React.cloneElement(icon, { className: 'text-gray-400', size: 24 })}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6 mx-auto leading-relaxed">
                {message}
            </p>
            {action !== 'N/A' && (
                <button className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline">
                    {action} &rarr;
                </button>
            )}
        </div>
    );
}

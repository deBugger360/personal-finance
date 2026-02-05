import React, { useState, useEffect } from 'react';
import { api } from './lib/api';
import { DashboardView } from './features/dashboard/DashboardView';
import { InsightCard } from './features/insights/InsightCard';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, DollarSign, TrendingDown, Wallet, Plus } from 'lucide-react';
import { getIconForCategory } from './lib/categoryIcons';
import { OnboardingHero } from './features/onboarding/OnboardingHero';

export function Home() {
    const [summary, setSummary] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const refreshData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [sumData, transData, catsData] = await Promise.all([
                api.get(`/summary?month=${new Date().toISOString().slice(0, 7)}`),
                api.get('/transactions'),
                api.get('/categories')
            ]);

            setSummary(sumData);
            setTransactions(transData.slice(0, 5)); // Show top 5 on home
            setCategories(catsData);
        } catch (err) {
            console.error(err);
            setError("Unable to connect to the server. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-24 bg-gray-200 rounded-xl mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-white border border-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-white border border-gray-200 rounded-xl"></div>
                    <div className="h-32 bg-white border border-gray-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 inline-block max-w-md w-full shadow-sm">
                <h2 className="text-xl font-bold text-red-700 mb-2">Connection Failed</h2>
                <p className="text-red-600 mb-6 text-sm">{error}</p>
                <button
                    onClick={refreshData}
                    className="w-full px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    // Get category icon using shared utility
    const getCategoryIcon = (categoryName) => {
        const Icon = getIconForCategory(categoryName);
        return <Icon size={20} className="text-gray-500" strokeWidth={2} />;
    };

    const showOnboarding = transactions.length === 0;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            {/* Greeting & Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                        Hello, <span className="gradient-text">Chief</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/add')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>Quick Add</span>
                </button>
            </header>

            {showOnboarding ? (
                <OnboardingHero />
            ) : (
                <>
                    {/* Insight Card */}
                    <div className="mb-8">
                        <InsightCard />
                    </div>

                    {/* Dashboard Stats */}
                    <DashboardView summary={summary} />

                    {/* Recent Activity */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <button
                                onClick={() => navigate('/transactions')}
                                className="group flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                            >
                                See All
                                <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="divide-y divide-gray-100">
                                {transactions.map(t => (
                                    <div
                                        key={t.id}
                                        className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate('/transactions')}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 rounded-lg flex items-center justify-center transition-all">
                                            {getCategoryIcon(t.category_name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">
                                                {t.category_name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {t.description || new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className={`font-bold text-right ${t.type === 'income' ? 'text-green-600' : 'text-gray-900'
                                            }`}>
                                            {t.type === 'expense' ? '-' : '+'}
                                            ${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

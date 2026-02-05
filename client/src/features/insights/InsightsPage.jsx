import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AlertTriangle, Lightbulb, TrendingUp, Info, CheckCircle } from 'lucide-react';

export function InsightsPage() {
    const [insights, setInsights] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        api.get('/insights')
            .then(data => {
                setInsights(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredInsights = filter === 'all'
        ? insights
        : insights.filter(i => i.type === filter);

    const counts = insights.reduce((acc, insight) => {
        acc[insight.type] = (acc[insight.type] || 0) + 1;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="space-y-3">
                        <div className="h-32 bg-white border border-gray-200 rounded-card"></div>
                        <div className="h-32 bg-white border border-gray-200 rounded-card"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Header */}
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Financial Insights
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                    Data-backed observations from the last 30 days
                </p>
            </header>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
                <FilterPill
                    label="All"
                    count={insights.length}
                    active={filter === 'all'}
                    onClick={() => setFilter('all')}
                />
                <FilterPill
                    label="Risks"
                    count={counts.risk || 0}
                    type="risk"
                    active={filter === 'risk'}
                    onClick={() => setFilter('risk')}
                />
                <FilterPill
                    label="Opportunities"
                    count={counts.opportunity || 0}
                    type="opportunity"
                    active={filter === 'opportunity'}
                    onClick={() => setFilter('opportunity')}
                />
                <FilterPill
                    label="Trends"
                    count={counts.trend || 0}
                    type="trend"
                    active={filter === 'trend'}
                    onClick={() => setFilter('trend')}
                />
                <FilterPill
                    label="Observations"
                    count={counts.observation || 0}
                    type="observation"
                    active={filter === 'observation'}
                    onClick={() => setFilter('observation')}
                />
            </div>

            {/* Timeline */}
            {filteredInsights.length === 0 ? (
                <EmptyState filter={filter} />
            ) : (
                <div className="space-y-3">
                    {filteredInsights.map((insight, idx) => (
                        <InsightCard
                            key={idx}
                            insight={insight}
                            expanded={expandedCard === idx}
                            onToggle={() => setExpandedCard(expandedCard === idx ? null : idx)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterPill({ label, count, type, active, onClick }) {
    const baseClasses = "px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer";

    const typeColors = {
        risk: active
            ? "bg-red-500 text-white border-red-500"
            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        opportunity: active
            ? "bg-green-500 text-white border-green-500"
            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        trend: active
            ? "bg-amber-500 text-white border-amber-500"
            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        observation: active
            ? "bg-gray-500 text-white border-gray-500"
            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
    };

    const defaultColors = active
        ? "bg-green-500 text-white border-green-500"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${type ? typeColors[type] : defaultColors}`}
        >
            {label} {count > 0 && <span className="ml-1">({count})</span>}
        </button>
    );
}

function InsightCard({ insight, expanded, onToggle }) {
    const icons = {
        risk: <AlertTriangle size={20} strokeWidth={2} />,
        opportunity: <Lightbulb size={20} strokeWidth={2} />,
        trend: <TrendingUp size={20} strokeWidth={2} />,
        observation: <Info size={20} strokeWidth={2} />,
        success: <CheckCircle size={20} strokeWidth={2} />,
    };

    const borderColors = {
        risk: 'border-l-red-500',
        opportunity: 'border-l-green-500',
        trend: 'border-l-amber-500',
        observation: 'border-l-gray-400',
        success: 'border-l-green-500',
    };

    const iconColors = {
        risk: 'text-red-500',
        opportunity: 'text-green-600',
        trend: 'text-amber-500',
        observation: 'text-gray-500',
        success: 'text-green-600',
    };

    const bgColors = {
        risk: 'bg-red-50',
        opportunity: 'bg-green-50',
        trend: 'bg-amber-50',
        observation: 'bg-gray-50',
        success: 'bg-green-50',
    };

    const priority = insight.priority !== undefined && insight.priority <= 1;

    return (
        <div
            className={`
        ${bgColors[insight.type] || 'bg-white'}
        ${borderColors[insight.type] || 'border-l-gray-300'} 
        border-l-4 border border-gray-200 rounded-r-card cursor-pointer transition-all
        hover:shadow-card-hover
        ${priority ? 'p-5' : 'p-4'}
      `}
            onClick={onToggle}
        >
            <div className="flex items-start gap-3">
                <div className={`${iconColors[insight.type] || 'text-gray-400'} flex-shrink-0 mt-1`}>
                    {icons[insight.type] || icons.observation}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-base">
                            {insight.title}
                        </h3>
                        {priority && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded flex-shrink-0">
                                High Priority
                            </span>
                        )}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {insight.message}
                    </p>

                    {expanded && insight.data && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    The Data
                                </h4>
                                <pre className="text-xs bg-gray-100 p-3 rounded text-gray-700 font-mono overflow-x-auto border border-gray-200">
                                    {JSON.stringify(insight.data, null, 2)}
                                </pre>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    What You Can Do
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {getActionSuggestion(insight)}
                                </p>
                            </div>
                        </div>
                    )}

                    {!expanded && (
                        <div className="mt-2 text-xs text-gray-500">
                            Click to expand
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ filter }) {
    return (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-card">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'All Clear!' : `No ${filter}s detected`}
            </h3>
            <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                {filter === 'all'
                    ? "No risks or concerns detected this month. Keep up the great work!"
                    : `There are currently no ${filter} insights to display.`
                }
            </p>
        </div>
    );
}

function getActionSuggestion(insight) {
    switch (insight.type) {
        case 'risk':
            return "Review your recent transactions in this category and consider adjusting your budget or spending habits for the remainder of the month.";
        case 'opportunity':
            return "Consider allocating this surplus to one of your active goals to accelerate progress.";
        case 'trend':
            return "Monitor this trend over the next few weeks to determine if it's temporary or requires budget adjustments.";
        case 'observation':
            return "Review the pattern to see if you want to track this more explicitly or adjust category assignments.";
        default:
            return "Review the data and decide if any action is needed.";
    }
}

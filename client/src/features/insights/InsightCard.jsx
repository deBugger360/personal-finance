import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Lightbulb, AlertTriangle, TrendingUp, Info, CheckCircle } from 'lucide-react';

export function InsightCard() {
    const [insight, setInsight] = useState(null);

    useEffect(() => {
        api.get('/insights')
            .then(data => {
                if (data && data.length > 0) setInsight(data[0]); // Only show top insight
            })
            .catch(console.error);
    }, []);

    if (!insight) return null;

    const iconMap = {
        'risk': <AlertTriangle size={20} strokeWidth={2} />,
        'opportunity': <Lightbulb size={20} strokeWidth={2} />,
        'trend': <TrendingUp size={20} strokeWidth={2} />,
        'observation': <Info size={20} strokeWidth={2} />,
        'success': <CheckCircle size={20} strokeWidth={2} />,
        // V1 Backward compatibility
        'warning': <TrendingUp size={20} strokeWidth={2} />,
        'alert': <AlertTriangle size={20} strokeWidth={2} />
    };

    const bgMap = {
        'risk': 'bg-red-50 border-red-200',
        'opportunity': 'bg-green-50 border-green-200',
        'trend': 'bg-amber-50 border-amber-200',
        'observation': 'bg-gray-50 border-gray-200',
        'success': 'bg-green-50 border-green-200',
        'warning': 'bg-amber-50 border-amber-200',
        'alert': 'bg-red-50 border-red-200'
    };

    const iconColorMap = {
        'risk': 'text-red-600',
        'opportunity': 'text-green-600',
        'trend': 'text-amber-600',
        'observation': 'text-gray-600',
        'success': 'text-green-600',
        'warning': 'text-amber-600',
        'alert': 'text-red-600'
    };

    return (
        <div className={`
            ${bgMap[insight.type] || 'bg-gray-50 border-gray-200'}
            border rounded-card p-4 mb-6 flex gap-3 items-start animate-fade-in
        `}>
            <div className={`${iconColorMap[insight.type] || 'text-gray-600'} flex-shrink-0 mt-0.5`}>
                {iconMap[insight.type] || iconMap['observation']}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 mb-1">{insight.title}</div>
                <div className="text-sm text-gray-700 leading-relaxed">{insight.message}</div>
            </div>
        </div>
    );
}

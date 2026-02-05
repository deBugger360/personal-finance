import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

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

    // AI V2 supports: risk, opportunity, trend, observation, success
    const bgMap = {
        'risk': 'rgba(255, 77, 77, 0.15)',
        'opportunity': 'rgba(0, 200, 255, 0.15)',
        'trend': 'rgba(255, 193, 7, 0.15)',
        'observation': 'rgba(150, 150, 150, 0.15)',
        'success': 'rgba(0, 255, 128, 0.15)',
        // V1 Backward compatibility
        'warning': 'rgba(255, 193, 7, 0.15)',
        'alert': 'rgba(255, 77, 77, 0.15)'
    };

    const borderMap = {
        'risk': 'var(--danger)',
        'opportunity': '#00C8FF',
        'trend': 'var(--warning)',
        'observation': '#999',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'alert': 'var(--danger)'
    };

    const iconMap = {
        'risk': <AlertTriangle size={20} color="var(--danger)" />,
        'opportunity': <Lightbulb size={20} color="#00C8FF" />,
        'trend': <TrendingUp size={20} color="var(--warning)" />,
        'observation': <TrendingUp size={20} color="#999" />,
        'success': <Lightbulb size={20} color="var(--success)" />,
        'warning': <TrendingUp size={20} color="var(--warning)" />,
        'alert': <AlertTriangle size={20} color="var(--danger)" />
    };

    return (
        <div className="animate-fade-in" style={{
            background: bgMap[insight.type] || 'rgba(255,255,255,0.1)',
            border: `1px solid ${borderMap[insight.type]}`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'start'
        }}>
            <div style={{ marginTop: '2px' }}>{iconMap[insight.type]}</div>
            <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{insight.title}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: '1.4' }}>{insight.message}</div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/api';
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';

export function InsightCard() {
    const [insight, setInsight] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/insights`)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) setInsight(data[0]); // Only show top insight
            });
    }, []);

    if (!insight) return null;

    const bgMap = {
        'warning': 'rgba(255, 193, 7, 0.15)',
        'alert': 'rgba(255, 77, 77, 0.15)',
        'success': 'rgba(0, 255, 128, 0.15)'
    };

    const borderMap = {
        'warning': 'var(--warning)',
        'alert': 'var(--danger)',
        'success': 'var(--success)'
    };

    const iconMap = {
        'warning': <TrendingUp size={20} color="var(--warning)" />,
        'alert': <AlertTriangle size={20} color="var(--danger)" />,
        'success': <Lightbulb size={20} color="var(--success)" />
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

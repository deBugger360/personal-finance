import React from 'react';
import { formatMoney } from '../../lib/utils';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';

export function DashboardView({ summary }) {
    if (!summary) return null;

    const balance = summary.balance || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Income Card */}
            <div className="bg-white border border-gray-200 rounded-card p-6 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-600">Income (Total)</div>
                    <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp size={20} className="text-green-600" strokeWidth={2} />
                    </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatMoney(summary.total_income)}
                </div>
                <div className="text-xs text-gray-500">
                    Salary: {formatMoney(summary.salary)}
                </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-white border border-gray-200 rounded-card p-6 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-600">Expenses</div>
                    <div className="p-2 bg-red-100 rounded-lg">
                        <DollarSign size={20} className="text-red-600" strokeWidth={2} />
                    </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatMoney(summary.total_expense)}
                </div>
                <div className="text-xs text-gray-500">
                    This month
                </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white border border-gray-200 rounded-card p-6 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-600">Balance</div>
                    <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Wallet size={20} className={balance >= 0 ? 'text-green-600' : 'text-red-600'} strokeWidth={2} />
                    </div>
                </div>
                <div className={`text-2xl font-bold mb-1 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(balance)}
                </div>
                <div className="text-xs text-gray-500">
                    {balance >= 0 ? 'Surplus' : 'Deficit'}
                </div>
            </div>
        </div>
    );
}

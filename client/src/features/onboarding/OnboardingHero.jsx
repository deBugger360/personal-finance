import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet, ArrowRight } from 'lucide-react';

export function OnboardingHero() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Wallet size={40} className="text-green-600" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Let's find your baseline</h2>
            <p className="text-gray-500 max-w-md mb-10 text-lg">
                Your dashboard is waiting. Log your first transaction to unlock insights and see your money flow.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                <button
                    onClick={() => navigate('/add')}
                    className="group bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all text-left flex flex-col justify-between h-40 border border-green-500"
                >
                    <div className="p-2 bg-white/20 rounded-lg w-fit mb-4">
                        <PlusCircle size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-lg mb-1 flex items-center gap-2">
                            Log Expense
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                        <p className="text-green-50 text-sm">Bought coffee? Paid a bill? Track it now.</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/add')}
                    className="group bg-white hover:bg-gray-50 text-gray-900 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between h-40 border border-gray-200"
                >
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-lg w-fit mb-4">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-lg mb-1 flex items-center gap-2">
                            Add Income
                            <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">Got paid? Add your salary or current balance.</p>
                    </div>
                </button>
            </div>

            <p className="mt-12 text-sm text-gray-400">
                Data is stored locally and visible only to you.
            </p>
        </div>
    );
}

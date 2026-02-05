import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { getIconForCategory } from '../../lib/categoryIcons';
import { ChevronLeft, Calendar, FileText } from 'lucide-react';

export function AddExpenseView() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState('');
    const [selectedCat, setSelectedCat] = useState(null);
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState('expense'); // 'expense' or 'income'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/categories')
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCat || !amount) return;

        setLoading(true);
        try {
            await api.post('/transactions', {
                date,
                amount: parseFloat(amount),
                description,
                category_id: selectedCat,
                type
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Failed to save transaction');
        } finally {
            setLoading(false);
        }
    };

    // Filter categories by type
    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Type Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => { setType('expense'); setSelectedCat(null); }}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === 'expense'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('income'); setSelectedCat(null); }}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === 'income'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Income
                    </button>
                </div>

                {/* Amount Input */}
                <div className="text-center">
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                        {type === 'expense' ? 'How much did you spend?' : 'How much did you receive?'}
                    </label>
                    <div className="relative inline-block max-w-[80%]">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-400">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-5xl font-bold text-gray-900 text-center focus:outline-none placeholder-gray-200 py-4 pl-8"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Category Grid */}
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-4">Select Category</label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                        {filteredCategories.map(cat => {
                            const Icon = getIconForCategory(cat.name);
                            const isSelected = selectedCat === cat.id;

                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => setSelectedCat(cat.id)}
                                    className={`
                                        flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all duration-200 border
                                        ${isSelected
                                            ? 'bg-green-50 border-green-200 transform scale-105 shadow-sm'
                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        p-2.5 rounded-full transition-colors
                                        ${isSelected ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}
                                    `}>
                                        <Icon size={24} strokeWidth={2} />
                                    </div>
                                    <span className={`text-xs font-medium text-center truncate w-full ${isSelected ? 'text-green-700' : 'text-gray-500'}`}>
                                        {cat.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            No {type} categories found.
                        </div>
                    )}
                </div>

                {/* Date & Note Inputs */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                            <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-0.5">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full text-sm font-medium text-gray-900 focus:outline-none bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 mx-10"></div>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                            <FileText size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-0.5">Note</label>
                            <input
                                type="text"
                                placeholder="What is this for?"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full text-sm font-medium text-gray-900 focus:outline-none bg-transparent placeholder-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={!amount || !selectedCat || loading}
                    className={`
                        w-full py-3.5 text-lg font-bold text-white rounded-xl shadow-md transition-all transform active:scale-95
                        ${!amount || !selectedCat || loading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                        }
                    `}
                >
                    {loading ? 'Saving...' : 'Save Transaction'}
                </button>
            </form>
        </div>
    );
}

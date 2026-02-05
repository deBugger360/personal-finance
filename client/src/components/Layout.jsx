import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    TrendingUp,
    PlusCircle,
    Lightbulb,
    PiggyBank,
    Settings,
    Menu,
    X,
    List
} from 'lucide-react';

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const titles = {
            '/': 'Dashboard - FinanceApp',
            '/transactions': 'Transactions - FinanceApp',
            '/budgets': 'Budgets - FinanceApp',
            '/forecast': 'Forecast - FinanceApp',
            '/insights': 'Insights - FinanceApp',
            '/goals': 'Goals - FinanceApp',
            '/settings': 'Settings - FinanceApp',
            '/add': 'Add Transaction - FinanceApp',
        };
        // Match exact or fallback
        document.title = titles[location.pathname] || 'FinanceApp';
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out">
                <div className="flex flex-col flex-1 overflow-y-auto">
                    {/* Logo/Brand */}
                    <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                            <span className="font-bold text-lg tracking-tight">F</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 tracking-tight">FinanceApp</h1>
                            <p className="text-xs text-gray-500 font-medium">Personal Finance</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1">
                        {[
                            { path: '/', label: 'Dashboard', icon: LayoutDashboard },
                            { path: '/transactions', label: 'Transactions', icon: Receipt },
                            { path: '/budgets', label: 'Budgets', icon: List },
                            { path: '/forecast', label: 'Forecast', icon: TrendingUp },
                            { path: '/insights', label: 'Insights', icon: Lightbulb },
                            { path: '/goals', label: 'Goals', icon: PiggyBank },
                        ].map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-green-50 text-green-700 shadow-sm translate-x-1'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={20} className={isActive ? "text-green-600" : "text-gray-400 group-hover:text-green-500 transition-colors"} strokeWidth={2} />
                                        <span>{item.label}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-600"></div>}
                                    </>
                                )}
                            </NavLink>
                        ))}

                        {/* Add Transaction Button */}
                        <NavLink
                            to="/add"
                            className="flex items-center justify-center gap-2 px-3 py-3 mt-6 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 mx-2"
                        >
                            <PlusCircle size={18} strokeWidth={2.5} />
                            <span>Add Transaction</span>
                        </NavLink>
                    </nav>

                    {/* Settings at Bottom */}
                    <div className="px-3 py-4 border-t border-gray-100">
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`
                            }
                        >
                            <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Mobile Header with Close Button */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">FinanceApp</h1>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {[
                            { path: '/', label: 'Dashboard', icon: LayoutDashboard },
                            { path: '/transactions', label: 'Transactions', icon: Receipt },
                            { path: '/budgets', label: 'Budgets', icon: List },
                            { path: '/forecast', label: 'Forecast', icon: TrendingUp },
                            { path: '/insights', label: 'Insights', icon: Lightbulb },
                            { path: '/goals', label: 'Goals', icon: PiggyBank },
                        ].map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={22} className={isActive ? "text-green-600" : "text-gray-400"} />
                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}

                        <NavLink
                            to="/add"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center justify-center gap-2 px-4 py-3 mt-6 text-base font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md active:scale-95 transition-all"
                        >
                            <PlusCircle size={20} />
                            <span>Add Transaction</span>
                        </NavLink>
                    </nav>

                    <div className="px-4 py-4 border-t border-gray-100">
                        <NavLink
                            to="/settings"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            <Settings size={22} />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Mobile Header with Hamburger */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-30 transition-all">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu size={24} strokeWidth={2} />
                        </button>

                        {/* Mobile Page Indicator */}
                        <div className="text-sm font-semibold text-gray-900">
                            FinanceApp
                        </div>

                        <div className="w-10"></div> {/* Spacer */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

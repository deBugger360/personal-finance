import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, PiggyBank, Settings, List } from 'lucide-react';

export function Layout() {
    return (
        <div className="app-wrapper">
            <main className="main-content animate-fade-in">
                <Outlet />
            </main>

            <nav className="bottom-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={24} />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <List size={24} />
                    <span>Ledger</span>
                </NavLink>
                <NavLink to="/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span style={{ fontSize: '1.2rem' }}>🔢</span>
                    <span>Plan</span>
                </NavLink>
                <NavLink to="/add" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} nav-add`}>
                    <PlusCircle size={32} />
                </NavLink>
                <NavLink to="/goals" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PiggyBank size={24} />
                    <span>Goals</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={24} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
}


import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LayoutDashboardIcon, UsersIcon, PaintBrushIcon, BellIcon, CogIcon, LockIcon } from './icons';

const AdminSidebar: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { t } = context;

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `group flex items-center gap-3 px-4 rounded-[var(--border-radius-lg)] text-sm font-medium transition-colors ${
            isActive 
            ? 'bg-[var(--color-primary-500)] text-white' 
            : 'text-slate-700 dark:text-slate-300 hover:bg-[var(--color-primary-500)] hover:text-white'
        }`;

    return (
        <aside className="w-64 bg-slate-100 dark:bg-slate-800/50 p-4 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-[64px]">
            <nav className="space-y-2">
                <NavLink to="/app/admin/dashboard" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <LayoutDashboardIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_dashboard')}</span>
                </NavLink>
                <NavLink to="/app/admin/users" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <UsersIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_users')}</span>
                </NavLink>
                <NavLink to="/app/admin/appearance" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <PaintBrushIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_appearance')}</span>
                </NavLink>
                <NavLink to="/app/admin/notifications" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <BellIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_notifications')}</span>
                </NavLink>
                <NavLink to="/app/admin/settings" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <CogIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_settings')}</span>
                </NavLink>
                <NavLink to="/app/admin/security" className={navLinkClasses} style={{ paddingBlock: 'var(--space-sidebar-py, 0.625rem)' }}>
                    <LockIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
                    <span className="group-hover:text-white transition-colors">{t('admin_security')}</span>
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;


import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card } from './ui';
import { UsersIcon, CreditCardIcon } from './icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <Card className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { users, t } = context;

    const totalUsers = users.length - 1; // Exclude admin
    const totalCredits = users
        .filter(u => u.email !== 'admin@invoice.ma')
        .reduce((sum, user) => sum + user.credits, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{t('admin_dashboard')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    icon={<UsersIcon className="h-6 w-6 text-blue-600" />} 
                    title={t('totalUsers')} 
                    value={totalUsers} 
                    color="bg-blue-100" />
                <StatCard 
                    icon={<CreditCardIcon className="h-6 w-6 text-green-600" />} 
                    title={t('totalCreditsDistributed')} 
                    value={totalCredits} 
                    color="bg-green-100" />
            </div>
        </div>
    );
};

export default AdminDashboard;

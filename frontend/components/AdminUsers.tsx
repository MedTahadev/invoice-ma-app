
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Card, Button } from './ui';
import { UserIcon, CreditCardIcon, PlusIcon, EditIcon } from './icons';

const AdminUsers: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const [notification, setNotification] = useState('');

    if (!context) return null;
    const { users, addCredits, t, language } = context;

    const isRtl = language === 'ar';

    const handleAddCredits = (userId: string) => {
        addCredits(userId, 10); // Add 10 credits at a time
        setNotification(t('creditsAdded'));
        setTimeout(() => setNotification(''), 3000);
    };
    
    // Exclude admin from the list
    const regularUsers = users.filter(u => u.email !== 'admin@invoice.ma');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('admin_users')}</h1>
            
            {notification && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 p-4 rounded-md" role="alert">
                    <p>{notification}</p>
                </div>
            )}
            
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t('manageUsers')}</h2>
                <div className="space-y-4">
                    {regularUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <UserIcon className="h-10 w-10 text-slate-500 dark:text-slate-400 p-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                )}
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <CreditCardIcon className="h-4 w-4" />
                                        {t('credits')}: {user.credits}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => handleAddCredits(user.id)}>
                                    <PlusIcon className="h-4 w-4" />
                                    {t('addCredits')}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/app/admin/user/edit/${user.id}`)}>
                                    <EditIcon className="h-4 w-4" />
                                    {t('edit')}
                                </Button>
                            </div>
                        </div>
                    ))}
                    {regularUsers.length === 0 && (
                        <p className="text-center text-slate-500 p-4">{isRtl ? 'لا يوجد مستخدمون لعرضهم.' : 'No users to display.'}</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminUsers;

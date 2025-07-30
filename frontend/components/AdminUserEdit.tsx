
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Card, Input, Button, Select, Modal } from './ui';
import { CompanySettings, User } from '../types';
import { PlusIcon } from './icons';

const AdminUserEdit: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    const [user, setUser] = useState<User | null>(null);
    const [userSettings, setUserSettings] = useState<CompanySettings | null>(null);
    const [notification, setNotification] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (context && userId) {
            const foundUser = context.getUserById(userId);
            if (foundUser) {
                setUser(foundUser);
                // Directly get settings from localStorage for this user (simulation)
                const settingsStr = localStorage.getItem(`invoice-settings-${foundUser.email}`);
                if (settingsStr) {
                    setUserSettings(JSON.parse(settingsStr));
                }
            } else {
                navigate('/app/admin/users');
            }
        }
    }, [userId, context]);

    if (!context || !user || !userSettings) {
        return <div>Loading...</div>;
    }
    
    const { t, language, updateUserSettings, addCredits, resetUserPassword } = context;
    const isRtl = language === 'ar';

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserSettings(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await updateUserSettings(user.id, userSettings)) {
            setNotification(t('settingsSaved'));
            setTimeout(() => setNotification(''), 3000);
        }
    };
    
    const handleAddCredits = () => {
        addCredits(user.id, 10);
        setUser(prev => prev ? { ...prev, credits: prev.credits + 10 } : null);
        setNotification(t('creditsAdded'));
        setTimeout(() => setNotification(''), 3000);
    };
    
    const handleResetPassword = async () => {
        if (await resetUserPassword(user.id, 'password123')) {
            setNotification(t('passwordResetSuccess'));
            setTimeout(() => setNotification(''), 3000);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('editUserTitle')}: <span className="text-[var(--color-primary-500)]">{user.name}</span></h1>

            {notification && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 p-4 rounded-md" role="alert">
                    <p>{notification}</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSaveSettings}>
                        <Card>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('companySettings')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input id="name" name="name" label={t('companyName')} value={userSettings.name} onChange={handleSettingsChange} isRtl={isRtl} />
                                <Input id="email" name="email" type="email" label={t('companyEmail')} value={userSettings.email} readOnly disabled isRtl={isRtl} />
                                <Input id="phone" name="phone" label={t('companyPhone')} value={userSettings.phone} onChange={handleSettingsChange} isRtl={isRtl} />
                                <Input id="address" name="address" label={t('companyAddress')} value={userSettings.address} onChange={handleSettingsChange} isRtl={isRtl} className="md:col-span-2" />
                                <Input id="ice" name="ice" label={t('companyIce')} value={userSettings.ice} onChange={handleSettingsChange} isRtl={isRtl} />
                                <Input id="iff" name="iff" label={t('companyIf')} value={userSettings.iff} onChange={handleSettingsChange} isRtl={isRtl} />
                                <Input id="rc" name="rc" label={t('companyRc')} value={userSettings.rc} onChange={handleSettingsChange} isRtl={isRtl} />
                                <Input id="defaultTaxRate" name="defaultTaxRate" type="number" label={t('defaultTaxRate')} value={userSettings.defaultTaxRate} onChange={handleSettingsChange} isRtl={isRtl} />
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button type="submit">{t('saveSettings')}</Button>
                            </div>
                        </Card>
                    </form>
                </div>
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{t('credits')}</h3>
                        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">{user.credits}</p>
                        <Button onClick={handleAddCredits} className="w-full">
                            <PlusIcon className="h-4 w-4" />
                            {t('addCredits')} (10)
                        </Button>
                    </Card>
                     <Card>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t('resetUserPassword')}</h3>
                        <Button variant="danger" onClick={() => setIsModalOpen(true)} className="w-full">
                            {t('resetUserPassword')}
                        </Button>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('resetUserPassword')}>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{t('resetPasswordConfirmation')}</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
                    <Button variant="danger" onClick={handleResetPassword}>{t('confirm')}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUserEdit;

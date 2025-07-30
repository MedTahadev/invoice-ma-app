
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Input } from './ui';

const AdminSecurity: React.FC = () => {
    const context = useContext(AppContext);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!context) return null;
    const { t, language, updateAdminPassword } = context;
    const isRtl = language === 'ar';

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('passwordsDoNotMatch'));
            return;
        }
        
        const wasUpdated = await updateAdminPassword(newPassword);
        if (wasUpdated) {
            setSuccess(t('passwordChangedSuccess'));
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError('Could not update password.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{t('admin_security')}</h1>

            <form onSubmit={handleSave}>
                <Card>
                    <h2 className="text-xl font-bold text-slate-800 mb-4">{t('changeAdminPassword')}</h2>
                    
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</p>}
                    {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">{success}</p>}
                    
                    <div className="space-y-4">
                        <Input
                            label={t('newPassword')}
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            isRtl={isRtl}
                            required
                        />
                        <Input
                            label={t('confirmNewPassword')}
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isRtl={isRtl}
                            required
                        />
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button type="submit">{t('saveChanges')}</Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default AdminSecurity;

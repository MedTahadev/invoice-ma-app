
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, TextArea, Select } from './ui';

const AdminNotifications: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { t, globalNotification, updateGlobalNotification, language } = context;
    const isRtl = language === 'ar';

    const [localNotification, setLocalNotification] = useState(globalNotification || { id: 'default-notification', message: '', isActive: false });
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateGlobalNotification(localNotification);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{t('admin_notifications')}</h1>

            <form onSubmit={handleSave}>
                <Card>
                    <div className="space-y-6">
                        <TextArea
                            label={t('notificationMessage')}
                            id="message"
                            value={localNotification.message}
                            onChange={(e) => setLocalNotification(p => ({...p, message: e.target.value}))}
                            rows={4}
                            isRtl={isRtl}
                        />
                        <Select
                            label={t('notificationStatus')}
                            id="isActive"
                            value={String(localNotification.isActive)}
                            onChange={(e) => setLocalNotification(p => ({...p, isActive: e.target.value === 'true'}))}
                            isRtl={isRtl}
                        >
                            <option value="true">{t('active')}</option>
                            <option value="false">{t('inactive')}</option>
                        </Select>
                    </div>
                    <div className="mt-8 flex justify-end items-center gap-4">
                        {showSuccess && <span className="text-sm text-green-600">{t('settingsSaved')}</span>}
                        <Button type="submit">{t('updateNotification')}</Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default AdminNotifications;

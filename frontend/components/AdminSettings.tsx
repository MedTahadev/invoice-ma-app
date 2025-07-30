
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Input, Button, Select } from './ui';
import { AdminGeneralSettings } from '../types';

const AdminSettings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { t, language, adminGeneralSettings, updateAdminGeneralSettings } = context;
    const isRtl = language === 'ar';

    const [localSettings, setLocalSettings] = useState<AdminGeneralSettings>(adminGeneralSettings);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRegistrationChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            registration: {
                ...prev.registration,
                [name]: name === 'allowRegistration' ? value === 'true' : Number(value)
            }
        }));
    };
    
    const handleDefaultInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            defaultInvoice: {
                ...prev.defaultInvoice,
                [name]: name === 'taxRate' ? Number(value) : value
            }
        }));
    };
    
    const handleMailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            mail: {
                ...prev.mail,
                [name]: name === 'port' ? Number(value) : value
            }
        }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateAdminGeneralSettings(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{t('admin_settings')}</h1>

            <form onSubmit={handleSave} className="space-y-8">
                <Card>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b">{t('userRegistration')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label={t('allowNewRegistrations')}
                            id="allowRegistration"
                            name="allowRegistration"
                            value={String(localSettings.registration.allowRegistration)}
                            onChange={handleRegistrationChange}
                            isRtl={isRtl}
                        >
                            <option value="true">{t('enabled')}</option>
                            <option value="false">{t('disabled')}</option>
                        </Select>
                        <Input
                            label={t('initialCreditsForNewUsers')}
                            id="initialCredits"
                            name="initialCredits"
                            type="number"
                            value={localSettings.registration.initialCredits}
                            onChange={handleRegistrationChange}
                            isRtl={isRtl}
                        />
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b">{t('defaultInvoiceSettings')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label={t('defaultCurrency')}
                            id="currency"
                            name="currency"
                            value={localSettings.defaultInvoice.currency}
                            onChange={handleDefaultInvoiceChange}
                            isRtl={isRtl}
                        >
                            <option value="MAD">MAD</option>
                            <option value="EUR">EUR</option>
                        </Select>
                        <Input
                            label={t('defaultTaxRate')}
                            id="taxRate"
                            name="taxRate"
                            type="number"
                            value={localSettings.defaultInvoice.taxRate}
                            onChange={handleDefaultInvoiceChange}
                            isRtl={isRtl}
                        />
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 pb-4 border-b">{t('mailSettings')}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label={t('smtpHost')} id="host" name="host" value={localSettings.mail.host} onChange={handleMailChange} isRtl={isRtl} />
                        <Input label={t('smtpPort')} id="port" name="port" type="number" value={localSettings.mail.port} onChange={handleMailChange} isRtl={isRtl} />
                        <Input label={t('smtpUser')} id="user" name="user" value={localSettings.mail.user} onChange={handleMailChange} isRtl={isRtl} />
                        <Input label={t('smtpPassword')} id="pass" name="pass" type="password" value={localSettings.mail.pass} onChange={handleMailChange} isRtl={isRtl} />
                        <div className="md:col-span-2">
                        <Select label={t('smtpEncryption')} id="encryption" name="encryption" value={localSettings.mail.encryption} onChange={handleMailChange} isRtl={isRtl}>
                            <option value="none">None</option>
                            <option value="ssl">SSL</option>
                            <option value="tls">TLS</option>
                        </Select>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end items-center gap-4">
                    {showSuccess && <span className="text-sm text-green-600">{t('settingsSaved')}</span>}
                    <Button type="submit">{t('saveChanges')}</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;


import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Input, Button, Select, TextArea } from './ui';
import { CompanySettings, MailSettings, BusinessType, AutoEntrepreneurType } from '../types';
import { UserIcon } from './icons';

// Profile Settings Card
const ProfileSettings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { t, language, currentUser, updateUserProfile } = context;
    const isRtl = language === 'ar';
    
    const [name, setName] = useState(currentUser?.name || '');
    const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setProfilePhoto(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        const result = await updateUserProfile({ name, profilePhoto });
        if(result.success) {
            setMessage({ type: 'success', text: result.message });
        }
    };

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (password.length > 0 && password !== confirmPassword) {
            setMessage({ type: 'error', text: t('passwordsDoNotMatch') });
            return;
        }
        if (password.length > 0 && password.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." });
            return;
        }

        const result = await updateUserProfile({ password });
        if(result.success) {
            setMessage({ type: 'success', text: t('passwordChangedSuccess') });
            setPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('profileSettings')}</h2>
            {message && <p className={`text-sm p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>{message.text}</p>}
            
            <form onSubmit={handleProfileSave} className="space-y-4">
                 <div className="flex items-center gap-4">
                    {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="h-20 w-20 rounded-full object-cover bg-slate-100" />
                    ) : (
                        <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                            <UserIcon className="w-10 h-10" />
                        </div>
                    )}
                    <div>
                        <input type="file" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                        <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>{t('changeLogo')}</Button>
                        {profilePhoto && <Button type="button" variant="ghost" onClick={() => setProfilePhoto('')}>{t('removeLogo')}</Button>}
                    </div>
                </div>
                <Input id="name" name="name" label={t('fullName')} value={name} onChange={e => setName(e.target.value)} isRtl={isRtl} />
                <div className="flex justify-end"><Button type="submit">{t('saveProfile')}</Button></div>
            </form>

            <hr className="my-8 dark:border-slate-700" />

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t('passwordSettings')}</h3>
             <form onSubmit={handlePasswordSave} className="space-y-4">
                <Input id="password" name="password" type="password" label={t('newPassword')} value={password} onChange={e => setPassword(e.target.value)} isRtl={isRtl} />
                <Input id="confirmPassword" name="confirmPassword" type="password" label={t('confirmNewPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} isRtl={isRtl} />
                <div className="flex justify-end"><Button type="submit">{t('changeAdminPassword')}</Button></div>
             </form>

        </Card>
    );
};

// Company Info Card
const CompanyInfoSettings: React.FC<{
    localSettings: CompanySettings,
    setLocalSettings: React.Dispatch<React.SetStateAction<CompanySettings>>
}> = ({ localSettings, setLocalSettings }) => {
    const { t, language } = useContext(AppContext)!;
    const isRtl = language === 'ar';
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: name === 'defaultTaxRate' ? Number(value) : value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setLocalSettings(prev => ({ ...prev, logo: event.target?.result as string }));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('companySettings')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input id="name" name="name" label={t('companyName')} value={localSettings.name} onChange={handleChange} isRtl={isRtl} />
                <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyLogo')}</label>
                    <div className="flex items-center gap-4">
                        {localSettings.logo ? (
                            <img src={localSettings.logo} alt="Company Logo" className="h-16 w-16 rounded-full object-cover bg-slate-100" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xs">Logo</div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>{t('changeLogo')}</Button>
                        {localSettings.logo && <Button type="button" variant="ghost" onClick={() => setLocalSettings(p => ({ ...p, logo: '' }))}>{t('removeLogo')}</Button>}
                    </div>
                </div>
                <Input id="email" name="email" type="email" label={t('companyEmail')} value={localSettings.email} onChange={handleChange} isRtl={isRtl} />
                <Input id="phone" name="phone" label={t('companyPhone')} value={localSettings.phone} onChange={handleChange} isRtl={isRtl} />
                <div className="md:col-span-2">
                    <Input id="address" name="address" label={t('companyAddress')} value={localSettings.address} onChange={handleChange} isRtl={isRtl} />
                </div>
                <Input id="ice" name="ice" label={t('companyIce')} value={localSettings.ice} onChange={handleChange} isRtl={isRtl} />
                <Input id="iff" name="iff" label={t('companyIf')} value={localSettings.iff} onChange={handleChange} isRtl={isRtl} />
                <Input id="rc" name="rc" label={t('companyRc')} value={localSettings.rc} onChange={handleChange} isRtl={isRtl} />
            </div>
        </Card>
    );
};

// Business Profile Card
const BusinessProfileSettings: React.FC<{
    localSettings: CompanySettings,
    setLocalSettings: React.Dispatch<React.SetStateAction<CompanySettings>>
}> = ({ localSettings, setLocalSettings }) => {
    const { t, language } = useContext(AppContext)!;
    const isRtl = language === 'ar';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value as any }));
    };

    return(
        <Card>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('businessProfile')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label={t('businessType')} id="businessType" name="businessType" value={localSettings.businessType} onChange={handleChange} isRtl={isRtl}>
                    <option value="company">{t('type_company')}</option>
                    <option value="auto-entrepreneur">{t('type_auto-entrepreneur')}</option>
                </Select>
                {localSettings.businessType === 'auto-entrepreneur' && (
                    <Select label={t('autoEntrepreneurType')} id="autoEntrepreneurType" name="autoEntrepreneurType" value={localSettings.autoEntrepreneurType} onChange={handleChange} isRtl={isRtl}>
                        <option value="services">{t('ae_services')}</option>
                        <option value="commercial">{t('ae_commercial')}</option>
                        <option value="industrial">{t('ae_industrial')}</option>
                        <option value="artisanal">{t('ae_artisanal')}</option>
                    </Select>
                )}
            </div>
        </Card>
    );
};

// Invoice Customization Card
const InvoiceCustomizationSettings: React.FC<{
    localSettings: CompanySettings,
    setLocalSettings: React.Dispatch<React.SetStateAction<CompanySettings>>
}> = ({ localSettings, setLocalSettings }) => {
    const { t, language } = useContext(AppContext)!;
    const isRtl = language === 'ar';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: name === 'defaultTaxRate' ? Number(value) : value }));
    };

    return(
        <Card>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('invoiceCustomization')}</h2>
            <div className="space-y-4">
                <Input label={t('invoiceNumberPrefix')} id="invoiceNumberPrefix" name="invoiceNumberPrefix" value={localSettings.invoiceNumberPrefix} onChange={handleChange} placeholder={t('invoicePrefixPlaceholder')} isRtl={isRtl} />
                <TextArea label={t('defaultInvoiceNotes')} id="defaultNotes" name="defaultNotes" value={localSettings.defaultNotes} onChange={handleChange} rows={3} isRtl={isRtl} />
                <Input id="defaultTaxRate" name="defaultTaxRate" type="number" label={t('defaultTaxRate')} value={localSettings.defaultTaxRate} onChange={handleChange} isRtl={isRtl} />
                <Select id="defaultCurrency" name="defaultCurrency" label={t('defaultCurrency')} value={localSettings.defaultCurrency} onChange={handleChange} isRtl={isRtl}>
                    <option value="MAD">MAD</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                </Select>
            </div>
        </Card>
    );
};


// Mail Settings Card
const MailConfigSettings: React.FC<{
    localSettings: CompanySettings,
    setLocalSettings: React.Dispatch<React.SetStateAction<CompanySettings>>
}> = ({ localSettings, setLocalSettings }) => {
    const { t, language } = useContext(AppContext)!;
    const [mailSettings, setMailSettings] = useState<MailSettings>(localSettings.mail || { host: '', port: 587, user: '', pass: '', encryption: 'tls' });
    const isRtl = language === 'ar';
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newMailSettings = {...mailSettings, [name]: name === 'port' ? Number(value) : value };
        setMailSettings(newMailSettings);
        setLocalSettings(prev => ({ ...prev, mail: newMailSettings }));
    };
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('mailSettings')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={t('smtpHost')} id="host" name="host" value={mailSettings.host} onChange={handleChange} isRtl={isRtl} />
                <Input label={t('smtpPort')} id="port" name="port" type="number" value={mailSettings.port} onChange={handleChange} isRtl={isRtl} />
                <Input label={t('smtpUser')} id="user" name="user" value={mailSettings.user} onChange={handleChange} isRtl={isRtl} />
                <Input label={t('smtpPassword')} id="pass" name="pass" type="password" value={mailSettings.pass} onChange={handleChange} isRtl={isRtl} />
                <div className="md:col-span-2">
                    <Select label={t('smtpEncryption')} id="encryption" name="encryption" value={mailSettings.encryption} onChange={handleChange} isRtl={isRtl}>
                        <option value="none">None</option>
                        <option value="ssl">SSL</option>
                        <option value="tls">TLS</option>
                    </Select>
                </div>
            </div>
        </Card>
    );
};


const Settings: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { t, settings, updateSettings } = context;

    const [localSettings, setLocalSettings] = useState(settings);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSaveAll = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <form onSubmit={handleSaveAll} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('settings')}</h1>
                <div className="flex items-center gap-4">
                    {showSuccess && <span className="text-sm text-green-600 dark:text-green-400">{t('settingsSaved')}</span>}
                    <Button type="submit">{t('saveSettings')}</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                   <ProfileSettings />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <BusinessProfileSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                    <CompanyInfoSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                    <InvoiceCustomizationSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                    <MailConfigSettings localSettings={localSettings} setLocalSettings={setLocalSettings} />
                </div>
            </div>
        </form>
    );
};

export default Settings;
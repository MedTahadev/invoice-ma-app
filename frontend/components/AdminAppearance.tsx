
import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Select } from './ui';
import { ThemeSettings } from '../types';

const AdminAppearance: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { t, themeSettings, updateThemeSettings, language } = context;
    const isRtl = language === 'ar';

    const [localSettings, setLocalSettings] = useState<ThemeSettings>(themeSettings);
    const [showSuccess, setShowSuccess] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value as any }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalSettings(prev => ({ ...prev, [field]: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateThemeSettings(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('admin_appearance')}</h1>

            <form onSubmit={handleSave} className="space-y-8">
                <Card>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 pb-4 border-b dark:border-slate-700">{t('customizeAppearance')}</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="primaryColor" className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${isRtl ? 'text-right' : ''}`}>{t('primaryColor')}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="primaryColor"
                                    name="primaryColor"
                                    type="color"
                                    value={localSettings.primaryColor}
                                    onChange={handleChange}
                                    className="h-10 w-10 p-1 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer bg-white dark:bg-slate-800"
                                />
                                 <input
                                    type="text"
                                    value={localSettings.primaryColor}
                                    onChange={handleChange}
                                    className="block w-full max-w-xs px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('appLogo')}</label>
                            <div className="flex items-center gap-4">
                                {localSettings.logo ? (
                                    <img src={localSettings.logo} alt="App Logo" className="h-16 w-auto bg-slate-100 dark:bg-slate-700 p-2 border dark:border-slate-600 rounded-md" />
                                ) : (
                                    <div className="h-16 w-24 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
                                        Logo
                                    </div>
                                )}
                                <input type="file" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="hidden" />
                                <Button type="button" variant="secondary" onClick={() => logoInputRef.current?.click()}>{t('changeLogo')}</Button>
                                {localSettings.logo && <Button type="button" variant="ghost" onClick={() => setLocalSettings(p => ({...p, logo: ''}))}>{t('removeLogo')}</Button>}
                            </div>
                        </div>

                        <div className={`space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('favicon')}</label>
                            <div className="flex items-center gap-4">
                                {localSettings.favicon ? (
                                    <img src={localSettings.favicon} alt="Favicon" className="h-8 w-8 bg-slate-100 dark:bg-slate-700 p-1 border dark:border-slate-600 rounded-md" />
                                ) : (
                                    <div className="h-8 w-8 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
                                        Icon
                                    </div>
                                )}
                                <input type="file" ref={faviconInputRef} onChange={(e) => handleFileChange(e, 'favicon')} accept="image/png, image/svg+xml, image/x-icon" className="hidden" />
                                <Button type="button" variant="secondary" onClick={() => faviconInputRef.current?.click()}>{t('changeLogo')}</Button>
                                {localSettings.favicon && <Button type="button" variant="ghost" onClick={() => setLocalSettings(p => ({...p, favicon: ''}))}>{t('removeLogo')}</Button>}
                            </div>
                        </div>

                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 pb-4 border-b dark:border-slate-700">{t('advancedAppearanceSettings')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        <Select
                            label={t('colorMode')}
                            id="colorMode"
                            name="colorMode"
                            value={localSettings.colorMode}
                            onChange={handleChange}
                            isRtl={isRtl}
                        >
                            <option value="light">{t('light')}</option>
                            <option value="dark">{t('dark')}</option>
                            <option value="system">{t('system')}</option>
                        </Select>
                        <Select
                            label={t('fontFamily')}
                            id="fontFamily"
                            name="fontFamily"
                            value={localSettings.fontFamily}
                            onChange={handleChange}
                            isRtl={isRtl}
                        >
                            <option value="Poppins">Poppins</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Cairo">Cairo</option>
                        </Select>
                        <Select
                            label={t('borderRadius')}
                            id="borderRadius"
                            name="borderRadius"
                            value={localSettings.borderRadius}
                            onChange={handleChange}
                            isRtl={isRtl}
                        >
                            <option value="none">{t('radius_none')}</option>
                            <option value="sm">{t('radius_sm')}</option>
                            <option value="md">{t('radius_md')}</option>
                            <option value="lg">{t('radius_lg')}</option>
                        </Select>
                         <Select
                            label={t('layoutDensity')}
                            id="layoutDensity"
                            name="layoutDensity"
                            value={localSettings.layoutDensity}
                            onChange={handleChange}
                            isRtl={isRtl}
                        >
                            <option value="comfortable">{t('density_comfortable')}</option>
                            <option value="compact">{t('density_compact')}</option>
                        </Select>
                    </div>
                </Card>


                <div className="flex justify-end items-center gap-4">
                    {showSuccess && <span className="text-sm text-green-600 dark:text-green-400">{t('settingsSaved')}</span>}
                    <Button type="submit">{t('saveChanges')}</Button>
                </div>
            </form>
        </div>
    );
};

export default AdminAppearance;


import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card } from './ui';

const Terms: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { t, language } = context;
    const isRtl = language === 'ar';

    // A simple CSS to style the content from dangerouslySetInnerHTML
    const proseStyle = `
        .prose p { margin-bottom: 1rem; }
        .prose strong { font-weight: 600; color: #1e293b; }
    `;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <style>{proseStyle}</style>
            <Card className="!p-8 md:!p-12">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">{t('termsTitle')}</h1>
                <div className={`text-slate-600 prose ${isRtl ? 'rtl text-right' : ''}`} dangerouslySetInnerHTML={{ __html: t('termsContent') }}>
                </div>
            </Card>
        </div>
    );
};

export default Terms;


import React, { useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Header from './Header';
import { AppContext } from '../context/AppContext';

const Footer = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { t } = context;

    return (
        <footer className="bg-slate-800 text-slate-300">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm">
                <div className="flex justify-center gap-4 mb-4">
                    <Link to="/terms" className="hover:text-white transition-colors">{t('termsOfService')}</Link>
                    <span className="text-slate-500">|</span>
                    <Link to="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy')}</Link>
                </div>
                <p className="text-slate-400">{t('footerText')}</p>
            </div>
        </footer>
    );
}

const PublicLayout: React.FC = () => {
    const context = useContext(AppContext);
    const location = useLocation();

    if (!context) return null;
    const { language } = context;

    const isLoginOrRegister = location.pathname === '/login' || location.pathname === '/register';
    
    // Auth pages have a different background and vertical centering
    const mainClasses = isLoginOrRegister
        ? "flex-grow flex flex-col justify-center items-center bg-slate-100 p-4"
        : "";
    
    return (
        <div className={`flex flex-col min-h-screen ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
            <Header />
            <main className={mainClasses}>
                <Outlet />
            </main>
            {!isLoginOrRegister && <Footer />}
        </div>
    );
};

export default PublicLayout;

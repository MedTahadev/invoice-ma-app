
import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import { AppContext } from '../context/AppContext';
import GlobalNotificationBanner from './GlobalNotificationBanner';

const AppLayout: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) {
        // This can be a loading state
        return null;
    }

    const { currentUser, language } = context;
    const location = window.location;
    const isPrintView = location.pathname.includes('/print');

    // If there is no user, redirect to login page.
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const isAdmin = currentUser.email === 'admin@invoice.ma';

    return (
        <div className={`bg-slate-50 min-h-screen ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
            {!isPrintView && <Header />}
            {!isAdmin && <GlobalNotificationBanner />}
            <main className={isPrintView ? "" : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;

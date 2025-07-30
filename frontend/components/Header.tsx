
import React, { useContext, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Button, Modal } from './ui';
import { FileTextIcon, SettingsIcon, LogOutIcon, CreditCardIcon, UserIcon, UsersIcon, LayoutDashboardIcon, BarChart2Icon, LandmarkIcon } from './icons';

const Header: React.FC = () => {
  const context = useContext(AppContext);
  const [isBuyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false);
  
  if (!context) return null;
  const { language, setLanguage, t, currentUser, logout, addCreditsToCurrentUser, themeSettings, settings } = context;

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-2 px-3 py-2 rounded-[var(--border-radius-lg)] text-sm font-medium transition-colors ${
      isActive 
      ? 'bg-[var(--color-primary-500)] text-white' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
    }`;
    
  const publicNavLinkClasses = `text-sm font-medium text-slate-600 hover:text-[var(--color-primary-500,theme(colors.indigo.600))] dark:text-slate-300 dark:hover:text-white transition-colors`;
  
  const isRtl = language === 'ar';
  const isAdmin = currentUser?.email === 'admin@invoice.ma';

  const handleBuyCredits = () => {
    addCreditsToCurrentUser(10);
    setBuyCreditsModalOpen(false);
  };
  
  const renderLogo = () => (
    <Link to={currentUser ? "/app" : "/"} className={`flex items-center gap-2 ${isRtl ? 'ml-4' : 'mr-4'}`}>
      {themeSettings.logo ? (
          <img src={themeSettings.logo} alt="App Logo" className="h-8 w-auto" />
      ) : (
          <FileTextIcon className="h-8 w-8 text-[var(--color-primary-500,theme(colors.indigo.600))]" />
      )}
      <span className="font-bold text-xl text-slate-800 dark:text-slate-100">Invoice.ma</span>
    </Link>
  );

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm dark:shadow-md dark:shadow-slate-800/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {currentUser ? (
              // Authenticated User Header
              <>
                <div className="flex items-center gap-4">
                  {renderLogo()}
                  <nav className="hidden md:flex items-center gap-1">
                    <NavLink to="/app/dashboard" className={navLinkClasses}>
                      <LayoutDashboardIcon className="h-4 w-4" />
                      {t('dashboard')}
                    </NavLink>
                    <NavLink to="/app/analytics" className={navLinkClasses}>
                      <BarChart2Icon className="h-4 w-4" />
                      {t('analytics')}
                    </NavLink>
                     <NavLink to="/app/clients" className={navLinkClasses}>
                      <UsersIcon className="h-4 w-4" />
                      {t('clients')}
                    </NavLink>
                    {settings.businessType === 'company' && (
                        <NavLink to="/app/tva-declaration" className={navLinkClasses}>
                            <LandmarkIcon className="h-4 w-4" />
                            {t('tvaDeclaration')}
                        </NavLink>
                    )}
                    {isAdmin && (
                      <NavLink to="/app/admin" className={navLinkClasses}>
                        <UserIcon className="h-4 w-4" />
                        {t('adminPanel')}
                      </NavLink>
                    )}
                    <NavLink to="/app/settings" className={navLinkClasses}>
                      <SettingsIcon className="h-4 w-4" />
                      {t('settings')}
                    </NavLink>
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{t('credits')}:</span>
                    <span className="font-bold text-[var(--color-primary-500,theme(colors.indigo.600))]">{currentUser?.credits}</span>
                    <Button variant="ghost" size="sm" onClick={() => setBuyCreditsModalOpen(true)}>
                      <CreditCardIcon className="h-4 w-4" />
                       {t('buyCredits')}
                    </Button>
                  </div>
                   <NavLink to="/app/invoice/new">
                      <Button size="sm">{t('newInvoice')}</Button>
                  </NavLink>
                  <div className="border-l h-8 border-slate-200 dark:border-slate-700"></div>
                  <Button variant="ghost" size="sm" onClick={logout} aria-label={t('logout')}>
                    <LogOutIcon className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              // Public Header
              <>
                 <div className="flex items-center gap-4">
                    {renderLogo()}
                 </div>
                 <nav className="hidden md:flex items-center gap-6">
                    <Link to="/#features" className={publicNavLinkClasses}>{t('features')}</Link>
                    <Link to="/#pricing" className={publicNavLinkClasses}>{t('pricing')}</Link>
                 </nav>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                        {language === 'fr' ? 'العربية' : 'Français'}
                    </Button>
                    <Link to="/login">
                        <Button variant="secondary" size="sm">{t('login')}</Button>
                    </Link>
                    <Link to="/register">
                        <Button size="sm">{t('register')}</Button>
                    </Link>
                 </div>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Modals are kept here to be accessible from the header */}
      <Modal isOpen={isBuyCreditsModalOpen} onClose={() => setBuyCreditsModalOpen(false)} title={t('buyCredits')}>
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-6">{t('invoiceCost')}</p>
          <Button size="lg" onClick={handleBuyCredits}>
            {isRtl ? "شراء 10 أرصدة مقابل 20 درهم" : "Acheter 10 crédits pour 20 DH"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Header;

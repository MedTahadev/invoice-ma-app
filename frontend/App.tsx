
import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './context/AppContext';

// Layouts
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';
import BareLayout from './components/BareLayout';
import AdminLayout from './components/AdminLayout';

// Public Pages
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import PublicInvoiceView from './components/PublicInvoiceView';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import ClientPortal from './components/ClientPortal';

// App Pages
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import InvoiceView from './components/InvoiceView';
import Settings from './components/Settings';
import Clients from './components/Clients';
import ClientForm from './components/ClientForm';
import Analytics from './components/Analytics';
import TvaDeclaration from './components/TvaDeclaration';


// Admin Pages
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminAppearance from './components/AdminAppearance';
import AdminNotifications from './components/AdminNotifications';
import AdminSettings from './components/AdminSettings';
import AdminSecurity from './components/AdminSecurity';
import AdminUserEdit from './components/AdminUserEdit';


const App: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null; // or a loading spinner
  const { language, currentUser, themeSettings } = context;

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    // Apply theme settings globally
    const root = document.documentElement;
    const body = document.body;

    // 1. Primary Color
    if (themeSettings.primaryColor) {
      root.style.setProperty('--color-primary-500', themeSettings.primaryColor);
      let hoverColor = themeSettings.primaryColor;
      if (hoverColor.startsWith('#') && hoverColor.length === 7) {
        let r = parseInt(hoverColor.substring(1,3), 16);
        let g = parseInt(hoverColor.substring(3,5), 16);
        let b = parseInt(hoverColor.substring(5,7), 16);
        r = Math.max(0, r - 20);
        g = Math.max(0, g - 20);
        b = Math.max(0, b - 20);
        hoverColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      root.style.setProperty('--color-primary-600', hoverColor);
    }
    
    // 2. Font Family
    body.className = body.className.replace(/font-\w+/g, '');
    body.classList.add(`font-${themeSettings.fontFamily?.toLowerCase() || 'sans'}`);

    // 3. Border Radius
    const radiusScales = {
      none: { md: '0px', lg: '0px', xl: '0px' },
      sm: { md: '0.25rem', lg: '0.375rem', xl: '0.5rem' },
      md: { md: '0.375rem', lg: '0.5rem', xl: '0.75rem' },
      lg: { md: '0.5rem', lg: '0.75rem', xl: '1rem' },
    };
    const currentScale = radiusScales[themeSettings.borderRadius || 'lg'] || radiusScales.lg;
    root.style.setProperty('--border-radius-md', currentScale.md);
    root.style.setProperty('--border-radius-lg', currentScale.lg);
    root.style.setProperty('--border-radius-xl', currentScale.xl);

    // 4. Favicon
    let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = themeSettings.favicon || '/vite.svg';
    }

    // 5. Layout Density
    const densityScales = {
        comfortable: { card: '1.5rem', sidebar: '0.625rem' },
        compact: { card: '1rem', sidebar: '0.5rem' },
    };
    const currentDensity = densityScales[themeSettings.layoutDensity || 'comfortable'] || densityScales.comfortable;
    root.style.setProperty('--space-card-padding', currentDensity.card);
    root.style.setProperty('--space-sidebar-py', currentDensity.sidebar);
    
  }, [themeSettings]);

  useEffect(() => {
    // 6. Color Mode (Dark/Light)
    const applyColorMode = (mode: 'dark' | 'light') => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (themeSettings.colorMode === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        applyColorMode(mediaQuery.matches ? 'dark' : 'light');
        const handler = (e: MediaQueryListEvent) => applyColorMode(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    } else {
        applyColorMode(themeSettings.colorMode || 'light');
    }
  }, [themeSettings.colorMode]);


  const isAdmin = currentUser?.email === 'admin@invoice.ma';

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={currentUser ? <Navigate to="/app" /> : <Home />} />
        <Route path="/login" element={currentUser ? <Navigate to="/app" /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/app" /> : <Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      {/* Protected Application Routes */}
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="invoice/new" element={<InvoiceForm />} />
        <Route path="invoice/edit/:id" element={<InvoiceForm />} />
        <Route path="invoice/view/:id" element={<InvoiceView />} />
        <Route path="settings" element={<Settings />} />
        <Route path="clients" element={<Clients />} />
        <Route path="client/new" element={<ClientForm />} />
        <Route path="client/edit/:id" element={<ClientForm />} />
        <Route path="tva-declaration" element={<TvaDeclaration />} />

        {/* Admin Routes */}
        {isAdmin && (
            <Route path="admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="user/edit/:userId" element={<AdminUserEdit />} />
                <Route path="appearance" element={<AdminAppearance />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="security" element={<AdminSecurity />} />
            </Route>
        )}
        
        {/* Redirect any unknown /app routes to the dashboard */}
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>
      
      {/* Public, un-styled route for sharing */}
      <Route element={<BareLayout />}>
          <Route path="/invoice/public/:data" element={<PublicInvoiceView />} />
          <Route path="/portal/:data" element={<ClientPortal />} />
      </Route>

      {/* Fallback for any other route */}
      <Route path="*" element={<Navigate to={currentUser ? "/app" : "/"} replace />} />
    </Routes>
  );
};

export default App;

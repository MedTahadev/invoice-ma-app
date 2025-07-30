
import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AppContextType, Invoice, CompanySettings, Language, User, Client, ThemeSettings, GlobalNotification, AdminGeneralSettings, Currency, ClientPortalData } from '../types';
import { TRANSLATIONS, DEFAULT_SETTINGS, DEFAULT_THEME_SETTINGS, DEFAULT_GLOBAL_NOTIFICATION, DEFAULT_ADMIN_SETTINGS } from '../constants';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api'; // Import the real API service

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('fr'); // Simplified state, could be from localStorage
  
  // App State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // For admin view
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Admin State
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [globalNotification, setGlobalNotification] = useState<GlobalNotification>(DEFAULT_GLOBAL_NOTIFICATION);
  const [adminGeneralSettings, setAdminGeneralSettings] = useState<AdminGeneralSettings>(DEFAULT_ADMIN_SETTINGS);

  const [isLoading, setIsLoading] = useState(true);

  // --- INITIALIZATION ---
  // This effect would run once on app load to check for a token and fetch initial data
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Here you would typically validate the token with the backend
      // and fetch the initial user data. For now, we simulate a simple load.
      // In a real app: api.validateToken(token).then(...)
      fetchInitialData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      // This is a placeholder for how you'd fetch all data after login
      // A real API would likely have separate endpoints or a combined one.
      // This simulates a user logging in and getting their data.
      const mockUser: User = { id: 'user1', name: 'John Doe', email: 'user@test.com', phone: '123', profilePhoto: '', credits: 10, dismissedNotifications:[] };
      setCurrentUser(mockUser);

      // In a real scenario, these would be separate or combined API calls
      // const initialData = await api.apiFetchInitialData();
      // setSettings(initialData.settings);
      // setInvoices(initialData.invoices);
      // setClients(initialData.clients);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
      // If fetching fails, log out the user
      logout();
    } finally {
      setIsLoading(false);
    }
  };
  
  const t = useCallback((key: string): string => {
    return TRANSLATIONS[language]?.[key] || key;
  }, [language]);

  // --- AUTH METHODS ---
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user, token } = await api.apiLogin(email, password);
      localStorage.setItem('auth_token', token); // Store token
      setCurrentUser(user);

      if (user.email === 'admin@invoice.ma') {
        // Fetch all admin data
        const adminData = await api.apiFetchAdminData();
        setUsers(adminData.users);
        setThemeSettings(adminData.themeSettings);
        setAdminGeneralSettings(adminData.adminGeneralSettings);
        setGlobalNotification(adminData.globalNotification);
        navigate('/app/admin');
      } else {
        // Fetch user-specific data
        const initialData = await api.apiFetchInitialData();
        setSettings(initialData.settings);
        setInvoices(initialData.invoices);
        setClients(initialData.clients);
        navigate('/app');
      }
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const register = async (name: string, companyName: string, phone: string, email: string, password: string): Promise<{ success: boolean, message: string }> => {
    try {
        const { user, token } = await api.apiRegister(name, companyName, phone, email, password);
        localStorage.setItem('auth_token', token);
        setCurrentUser(user);
        await fetchInitialData(); // Fetch the new user's default data
        navigate('/app');
        return { success: true, message: '' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('auth_token');
    navigate('/login');
  };
  
  const updateUserProfile = async (data: Partial<Pick<User, 'name' | 'password' | 'profilePhoto'>>): Promise<{success: boolean, message: string}> => {
    try {
        const { user } = await api.apiUpdateUserProfile(data);
        setCurrentUser(user);
        return { success: true, message: t('userProfileUpdated') };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  };

  // --- DATA METHODS ---
  const addInvoice = async (invoice: Invoice): Promise<{ success: boolean, message: string }> => {
      try {
          const newInvoice = await api.apiAddInvoice(invoice);
          setInvoices(prev => [...prev, newInvoice]);
          // The backend should handle credit deduction and return the updated user
          // For now, we simulate it on the frontend.
          if(currentUser) setCurrentUser({...currentUser, credits: currentUser.credits - 1});
          return { success: true, message: '' };
      } catch (error: any) {
          return { success: false, message: error.message };
      }
  };

  const updateInvoice = async (updatedInvoice: Invoice): Promise<{ success: boolean, message: string }> => {
      try {
          const resultInvoice = await api.apiUpdateInvoice(updatedInvoice);
          setInvoices(prev => prev.map(inv => (inv.id === resultInvoice.id ? resultInvoice : inv)));
           if(currentUser && updatedInvoice.editCount > 0) setCurrentUser({...currentUser, credits: currentUser.credits - 1});
          return { success: true, message: '' };
      } catch (error: any) {
          return { success: false, message: error.message };
      }
  };

  // ... other context methods would be converted similarly to be async and call the api service ...

  const value: AppContextType = {
    language,
    setLanguage,
    t,
    settings,
    // updateSettings should now be async
    updateSettings: async (newSettings: Partial<CompanySettings>) => {
        const updated = await api.apiUpdateSettings(newSettings);
        setSettings(updated);
    },
    invoices,
    getInvoiceById: (id: string) => invoices.find(inv => inv.id === id),
    addInvoice,
    updateInvoice,
    deleteInvoice: async (id: string) => {
        await api.apiDeleteInvoice(id);
        setInvoices(prev => prev.filter(inv => inv.id !== id));
    },
    // This should now come from backend logic
    getNextInvoiceNumber: () => `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(3,'0')}`,
    getExchangeRate: (from: Currency, to: Currency) => { // This would move to backend
      if (from === to) return 1;
      const MOCK_RATES: { [key: string]: number } = {
          'EUR_MAD': 10.95, 'USD_MAD': 9.85, 'MAD_EUR': 1 / 10.95, 'MAD_USD': 1 / 9.85,
      };
      return MOCK_RATES[`${from}_${to}`] || 1;
    },
    clients,
    getClientById: (id: string) => clients.find(c => c.id === id),
    addClient: async (client: Client) => {
        const newClient = await api.apiAddClient(client);
        setClients(prev => [...prev, newClient]);
    },
    updateClient: async (client: Client) => {
        const updatedClient = await api.apiUpdateClient(client);
        setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    },
    deleteClient: async (id: string) => {
        await api.apiDeleteClient(id);
        setClients(prev => prev.filter(c => c.id !== id));
    },
    getClientPortalData: (userId, clientId) => null, // This would now be a public backend endpoint call
    currentUser,
    users,
    login,
    register,
    logout,
    updateUserProfile,
    // The rest of these functions would be converted to async API calls
    addCredits: () => {},
    addCreditsToCurrentUser: () => {},
    dismissNotification: () => {},
    updateAdminPassword: async () => false,
    getUserById: (id) => users.find(u => u.id === id),
    updateUserSettings: async () => false,
    resetUserPassword: async () => false,
    themeSettings,
    updateThemeSettings: async (newSettings) => {
      const updated = await api.apiUpdateThemeSettings(newSettings);
      setThemeSettings(updated);
    },
    globalNotification,
    updateGlobalNotification: async (notification) => {
      const updated = await api.apiUpdateGlobalNotification(notification);
      setGlobalNotification(updated);
    },
    adminGeneralSettings,
    updateAdminGeneralSettings: async (newSettings) => {
      const updated = await api.apiUpdateAdminGeneralSettings(newSettings);
      setAdminGeneralSettings(updated);
    },
  };

  if (isLoading) {
    return <div>Loading Application...</div>; // Or a proper loading spinner
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

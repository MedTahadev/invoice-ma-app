// This service layer is designed to communicate with a real backend API.
// A backend developer (e.g., using Laravel) would implement these endpoints.

import {
  User,
  CompanySettings,
  Invoice,
  Client,
  ThemeSettings,
  AdminGeneralSettings,
  GlobalNotification,
  ClientPortalData
} from '../types';

// In a real app, this would be your backend URL, e.g., https://api.invoice.ma
const API_BASE_URL = '/api'; 

// A helper function to handle API requests and errors
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...restOptions } = options;

  // We would add an authorization token here in a real app
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  // For DELETE requests, which may not have a body
  if (response.status === 204) {
      return {} as T;
  }

  return response.json();
}


// --- Auth API ---
export const apiLogin = (email: string, password: string): Promise<{ user: User, token: string }> =>
  apiRequest('/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiRegister = (name: string, companyName: string, phone: string, email: string, password: string): Promise<{ user: User, token: string }> =>
  apiRequest('/register', { method: 'POST', body: JSON.stringify({ name, companyName, phone, email, password }) });

export const apiUpdateUserProfile = (data: Partial<User>): Promise<{ user: User }> =>
  apiRequest('/user/profile', { method: 'PATCH', body: JSON.stringify(data) });


// --- Data API (User-specific) ---
export const apiFetchInitialData = (): Promise<{ settings: CompanySettings, invoices: Invoice[], clients: Client[] }> =>
    apiRequest('/data/initial');

export const apiUpdateSettings = (settings: Partial<CompanySettings>): Promise<CompanySettings> =>
    apiRequest('/settings', { method: 'PATCH', body: JSON.stringify(settings) });

export const apiAddInvoice = (invoice: Omit<Invoice, 'id' | 'editCount'>): Promise<Invoice> =>
    apiRequest('/invoices', { method: 'POST', body: JSON.stringify(invoice) });

export const apiUpdateInvoice = (invoice: Invoice): Promise<Invoice> =>
    apiRequest(`/invoices/${invoice.id}`, { method: 'PUT', body: JSON.stringify(invoice) });

export const apiDeleteInvoice = (id: string): Promise<void> =>
    apiRequest(`/invoices/${id}`, { method: 'DELETE' });

export const apiAddClient = (client: Omit<Client, 'id'>): Promise<Client> =>
    apiRequest('/clients', { method: 'POST', body: JSON.stringify(client) });

export const apiUpdateClient = (client: Client): Promise<Client> =>
    apiRequest(`/clients/${client.id}`, { method: 'PUT', body: JSON.stringify(client) });

export const apiDeleteClient = (id: string): Promise<void> =>
    apiRequest(`/clients/${id}`, { method: 'DELETE' });
    
export const apiGetClientPortalData = (clientId: string): Promise<ClientPortalData> =>
    apiRequest(`/clients/${clientId}/portal`);


// --- Admin API ---
export const apiFetchAdminData = (): Promise<{ users: User[], themeSettings: ThemeSettings, globalNotification: GlobalNotification, adminGeneralSettings: AdminGeneralSettings }> =>
    apiRequest('/admin/data');
    
export const apiUpdateThemeSettings = (settings: Partial<ThemeSettings>): Promise<ThemeSettings> =>
    apiRequest('/admin/theme-settings', { method: 'POST', body: JSON.stringify(settings) });

export const apiUpdateGlobalNotification = (notification: GlobalNotification): Promise<GlobalNotification> =>
    apiRequest('/admin/notification', { method: 'POST', body: JSON.stringify(notification) });
    
export const apiUpdateAdminGeneralSettings = (settings: AdminGeneralSettings): Promise<AdminGeneralSettings> =>
    apiRequest('/admin/general-settings', { method: 'POST', body: JSON.stringify(settings) });

export const apiUpdateAdminPassword = (password: string): Promise<void> =>
    apiRequest('/admin/security/password', { method: 'POST', body: JSON.stringify({ password }) });
    
export const apiAdminAddCredits = (userId: string, amount: number): Promise<{ credits: number }> =>
    apiRequest(`/admin/users/${userId}/credits`, { method: 'POST', body: JSON.stringify({ amount }) });
    
export const apiAdminUpdateUserSettings = (userId: string, settings: CompanySettings): Promise<CompanySettings> =>
    apiRequest(`/admin/users/${userId}/settings`, { method: 'POST', body: JSON.stringify(settings) });
    
export const apiAdminResetUserPassword = (userId: string): Promise<void> =>
    apiRequest(`/admin/users/${userId}/reset-password`, { method: 'POST' });

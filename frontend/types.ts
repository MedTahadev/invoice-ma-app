
export type Language = 'fr' | 'ar';

export type Currency = 'MAD' | 'EUR' | 'USD';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type BusinessType = 'company' | 'auto-entrepreneur';
export type AutoEntrepreneurType = 'services' | 'commercial' | 'industrial' | 'artisanal';


export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  taxRate: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cin: string; // Carte d'Identité Nationale
  ice: string; // Identifiant Commun de l'Entreprise
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Client;
  items: InvoiceItem[];
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: Currency;
  notes?: string;
  subTotal: number;
  taxAmount: number;
  total: number;
  editCount: number;
  paymentDate?: string;
}

export interface CompanySettings {
  name: string;
  logo: string; // base64 string
  email: string;
  phone: string;
  address: string;
  ice: string; // Identifiant Commun de l'Entreprise
  iff: string; // Identifiant Fiscal
  rc: string; // Registre de Commerce
  defaultTaxRate: number;
  defaultCurrency: Currency;
  businessType: BusinessType;
  autoEntrepreneurType?: AutoEntrepreneurType;
  invoiceNumberPrefix: string;
  defaultNotes: string;
  mail: MailSettings;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  profilePhoto: string; // base64 string
  email: string;
  password?: string; // NOTE: Storing plaintext password for simulation only.
  credits: number;
  dismissedNotifications: string[];
}

export interface Translations {
  [key: string]: string;
}

export interface ThemeSettings {
  primaryColor: string;
  logo: string; // base64 string
  favicon: string; // base64 string
  colorMode: 'light' | 'dark' | 'system';
  fontFamily: 'Poppins' | 'Inter' | 'Roboto' | 'Cairo';
  borderRadius: 'none' | 'sm' | 'md' | 'lg';
  layoutDensity: 'comfortable' | 'compact';
}

export interface GlobalNotification {
  id: string;
  message: string;
  isActive: boolean;
}

export interface MailSettings {
    host: string;
    port: number;
    user: string;
    pass: string;
    encryption: 'none' | 'ssl' | 'tls';
}

export interface RegistrationSettings {
    allowRegistration: boolean;
    initialCredits: number;
}

export interface DefaultInvoiceSettings {
    currency: Currency;
    taxRate: number;
}

export interface AdminGeneralSettings {
    registration: RegistrationSettings;
    defaultInvoice: DefaultInvoiceSettings;
    mail: MailSettings;
}

export interface ClientPortalData {
    client: Client;
    invoices: Invoice[];
    settings: CompanySettings;
}


export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // User-specific data
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  invoices: Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Invoice) => Promise<{ success: boolean, message: string }>;
  updateInvoice: (invoice: Invoice) => Promise<{ success: boolean, message: string }>;
  deleteInvoice: (id: string) => void;
  getNextInvoiceNumber: () => string;
  getExchangeRate: (from: Currency, to: Currency) => number;
  
  // Clients
  clients: Client[];
  getClientById: (id: string) => Client | undefined;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  getClientPortalData: (userId: string, clientId: string) => ClientPortalData | null;


  // Auth & User Management
  currentUser: User | null;
  users: User[]; // For admin
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, companyName: string, phone: string, email: string, password: string) => Promise<{ success: boolean, message: string }>;
  logout: () => void;
  addCredits: (userId: string, amount: number) => void;
  addCreditsToCurrentUser: (amount: number) => void;
  dismissNotification: (notificationId: string) => void;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<Pick<User, 'name' | 'password' | 'profilePhoto'>>) => Promise<{success: boolean, message: string}>;
  getUserById: (userId: string) => User | undefined;
  updateUserSettings: (userId: string, newSettings: CompanySettings) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;

  // Admin - Global App Settings
  themeSettings: ThemeSettings;
  updateThemeSettings: (newSettings: Partial<ThemeSettings>) => void;
  globalNotification: GlobalNotification | null;
  updateGlobalNotification: (notification: GlobalNotification) => void;
  adminGeneralSettings: AdminGeneralSettings;
  updateAdminGeneralSettings: (newSettings: AdminGeneralSettings) => void;
}

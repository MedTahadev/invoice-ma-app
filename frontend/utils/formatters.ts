
import { Currency } from '../types';

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatCurrency = (amount: number, currency: Currency) => {
  return new Intl.NumberFormat(currency === 'MAD' ? 'fr-MA' : 'fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPhoneNumberForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  // remove spaces, dashes, parentheses
  let cleaned = phone.replace(/\s+|-|\(|\)/g, ''); 
  if (cleaned.startsWith('0')) {
    // Replace leading 0 with Moroccan country code
    cleaned = '212' + cleaned.substring(1); 
  }
  // Remove any non-digit characters that might be left
  return cleaned.replace(/\D/g, '');
};
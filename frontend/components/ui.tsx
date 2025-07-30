
import React, { ReactNode } from 'react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-[var(--border-radius-lg)]';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-[var(--color-primary-500,theme(colors.indigo.600))] text-white hover:bg-[var(--color-primary-600,theme(colors.indigo.700))] focus:ring-[var(--color-primary-500,theme(colors.indigo.500))] dark:focus:ring-offset-slate-900',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:focus:ring-offset-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800'
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  isRtl?: boolean;
}
export const Input: React.FC<InputProps> = ({ label, id, isRtl, ...props }) => (
  <div>
    <label htmlFor={id} className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${isRtl ? 'text-right' : ''}`}>{label}</label>
    <input id={id} className={`block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-[var(--border-radius-md)] shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm ${isRtl ? 'text-right' : ''}`} {...props} />
  </div>
);

// TextArea
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  isRtl?: boolean;
}
export const TextArea: React.FC<TextAreaProps> = ({ label, id, isRtl, ...props }) => (
  <div>
    <label htmlFor={id} className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${isRtl ? 'text-right' : ''}`}>{label}</label>
    <textarea id={id} className={`block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-[var(--border-radius-md)] shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm ${isRtl ? 'text-right' : ''}`} {...props} />
  </div>
);


// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
  isRtl?: boolean;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, isRtl, ...props }) => (
  <div>
    <label htmlFor={id} className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ${isRtl ? 'text-right' : ''}`}>{label}</label>
    <select id={id} className={`block w-full px-3 py-2 border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 rounded-[var(--border-radius-md)] shadow-sm focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm ${isRtl ? 'text-right' : ''}`} {...props}>
      {children}
    </select>
  </div>
);

// Card
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800/50 rounded-[var(--border-radius-xl)] shadow-sm p-[var(--space-card-padding,1.5rem)] ${className}`}>
    {children}
  </div>
);

// Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-[var(--border-radius-lg)] shadow-xl p-6 w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

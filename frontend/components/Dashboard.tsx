
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Invoice, InvoiceStatus } from '../types';
import { Card, Button, Modal } from './ui';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EyeIcon, EditIcon, TrashIcon, FileTextIcon, CheckCircleIcon, XCircleIcon, DollarSignIcon } from './icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
    <Card className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </Card>
);

const StatusBadge: React.FC<{ status: InvoiceStatus, text: string }> = ({ status, text }) => {
    const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
    const statusClasses = {
        draft: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
        sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        overdue: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{text}</span>
}

const RevenueTrackerCard: React.FC = () => {
    const { invoices, settings, t } = useContext(AppContext)!;

    const currentYear = new Date().getFullYear();
    const paidInvoicesThisYear = invoices.filter(inv => 
        inv.status === 'paid' && new Date(inv.issueDate).getFullYear() === currentYear
    );

    const annualRevenue = paidInvoicesThisYear.reduce((sum, inv) => sum + inv.total, 0);
    
    const REVENUE_CAPS = {
        services: 200000,
        industrial: 500000,
        commercial: 500000,
        artisanal: 500000,
    };

    const cap = REVENUE_CAPS[settings.autoEntrepreneurType || 'services'];
    const percentage = Math.min((annualRevenue / cap) * 100, 100);

    return (
        <Card className="lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{t('aeRevenueTracker')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('annualRevenue')}</p>
            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(annualRevenue, settings.defaultCurrency)}</span>
                    <span className="text-slate-500 dark:text-slate-400">{t('revenueCap')}: {formatCurrency(cap, 'MAD')}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </Card>
    );
};


const Dashboard: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

    if (!context) return null;
    const { invoices, deleteInvoice, t, language, currentUser, settings } = context;

    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidCount = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;

    const isRtl = language === 'ar';
    const isAutoEntrepreneur = settings.businessType === 'auto-entrepreneur';

    const handleDeleteClick = (id: string) => {
        setInvoiceToDelete(id);
    };

    const confirmDelete = () => {
        if (invoiceToDelete) {
            deleteInvoice(invoiceToDelete);
            setInvoiceToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('dashboard')}</h1>
                 <p className="text-slate-500 dark:text-slate-400">{t('welcome')}, <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser?.email}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<FileTextIcon className="h-6 w-6 text-indigo-600" />} title={t('totalInvoices')} value={invoices.length} color="bg-indigo-100 dark:bg-indigo-900/20" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} title={t('paid')} value={paidCount} color="bg-green-100 dark:bg-green-900/20" />
                {isAutoEntrepreneur ? (
                    <RevenueTrackerCard />
                ) : (
                    <>
                        <StatCard icon={<XCircleIcon className="h-6 w-6 text-red-600" />} title={t('unpaid')} value={unpaidCount} color="bg-red-100 dark:bg-red-900/20" />
                        <StatCard icon={<DollarSignIcon className="h-6 w-6 text-emerald-600" />} title={t('totalRevenue')} value={formatCurrency(totalRevenue, settings.defaultCurrency)} color="bg-emerald-100 dark:bg-emerald-900/20" />
                    </>
                )}
            </div>

            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t('invoices')}</h2>
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('invoiceNumber')}</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('customer')}</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('issueDate')}</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('amount')}</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('status')}</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? invoices.map((invoice: Invoice) => (
                                <tr key={invoice.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">{invoice.invoiceNumber}</td>
                                    <td className="p-3 text-slate-800 dark:text-slate-200">{invoice.customer.name}</td>
                                    <td className="p-3 text-slate-500 dark:text-slate-400">{formatDate(invoice.issueDate)}</td>
                                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{formatCurrency(invoice.total, invoice.currency)}</td>
                                    <td className="p-3"><StatusBadge status={invoice.status} text={t(invoice.status)} /></td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/invoice/view/${invoice.id}`)} aria-label={t('view')}><EyeIcon className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/invoice/edit/${invoice.id}`)} aria-label={t('edit')}><EditIcon className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(invoice.id)} className="text-red-500 hover:text-red-700" aria-label={t('delete')}><TrashIcon className="h-4 w-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-6 text-slate-500 dark:text-slate-400">{isRtl ? 'لا توجد فواتير لعرضها.' : 'No invoices to display.'}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={!!invoiceToDelete} onClose={() => setInvoiceToDelete(null)} title={t('confirmDelete')}>
                <p className="text-slate-600 dark:text-slate-300 mb-6">{t('confirmDelete')}</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setInvoiceToDelete(null)}>{t('cancel')}</Button>
                    <Button variant="danger" onClick={confirmDelete}>{t('confirm')}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
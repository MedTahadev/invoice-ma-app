
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ClientPortalData, Invoice, InvoiceStatus, Language } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button, Card, Modal, TextArea } from './ui';
import { DownloadIcon, MessageSquareIcon } from './icons';

// A mock context for the portal, as it's a public page
const PublicContext = React.createContext<{ t: (key: string) => string; language: Language } | null>(null);

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const { t } = useContext(PublicContext)!;
    const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
    const statusClasses = {
        draft: 'bg-slate-100 text-slate-800',
        sent: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{t(`status_${status}`)}</span>
}

const Toast: React.FC<{ message: string, show: boolean, onClose: () => void }> = ({ message, show, onClose }) => {
    useEffect(() => {
        if(show) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    return (
        <div className={`fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-transform transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {message}
        </div>
    )
}

const ClientPortal: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const context = useContext(AppContext);
    
    const [portalData, setPortalData] = useState<ClientPortalData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMessageModalOpen, setMessageModalOpen] = useState(false);
    const [currentInvoiceForMessage, setCurrentInvoiceForMessage] = useState<Invoice | null>(null);
    const [messageContent, setMessageContent] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (encodedData && context) {
            try {
                const { userId, clientId } = JSON.parse(atob(encodedData));
                const data = context.getClientPortalData(userId, clientId);

                if (data) {
                    setPortalData(data);
                    document.documentElement.lang = data.settings.defaultCurrency === 'MAD' ? 'fr' : 'en'; // Simple lang detection
                    document.documentElement.dir = data.settings.defaultCurrency === 'MAD' ? (context.language === 'ar' ? 'rtl' : 'ltr') : 'ltr';
                } else {
                    throw new Error("Invalid client or user ID.");
                }
            } catch (e) {
                console.error("Failed to load portal data:", e);
                setError("Could not load the client portal. The link may be invalid.");
            }
        }
    }, [encodedData, context]);

    if (error) return <div className="p-8 text-center text-red-500 bg-slate-100 min-h-screen flex items-center justify-center">{error}</div>;
    if (!portalData) return <div className="p-8 text-center bg-slate-100 min-h-screen flex items-center justify-center">Loading Portal...</div>;

    const { client, invoices, settings } = portalData;
    const { t, language } = context!;
    const isRtl = language === 'ar';

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const outstandingBalance = totalBilled - totalPaid;
    
    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(inv.issueDate).includes(searchTerm)
    ).sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    const openMessageModal = (invoice: Invoice) => {
        setCurrentInvoiceForMessage(invoice);
        setMessageModalOpen(true);
    };

    const handleSendMessage = () => {
        // Simulation
        console.log(`Message for invoice ${currentInvoiceForMessage?.invoiceNumber}: ${messageContent}`);
        setMessageContent('');
        setMessageModalOpen(false);
        setShowToast(true);
    };

    const publicContextValue = { t, language };

    return (
        <PublicContext.Provider value={publicContextValue}>
        <div className={`bg-slate-100 min-h-screen p-4 sm:p-8 ${isRtl ? 'font-cairo' : 'font-sans'}`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            {settings.logo ? (
                                <img src={settings.logo} alt="Company Logo" className="h-12 w-auto mb-2" />
                            ) : (
                                <h1 className="text-2xl font-bold text-slate-800">{settings.name}</h1>
                            )}
                            <h2 className="text-3xl font-bold text-slate-900 mt-2">{t('clientPortal')}</h2>
                            <p className="text-slate-600">{t('welcome')}, {client.name}</p>
                        </div>
                        <Card className="w-full sm:w-auto sm:max-w-sm">
                            <h3 className="font-bold text-lg mb-2">{t('accountStatement')}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>{t('totalInvoices_portal')}:</span> <span className="font-medium">{invoices.length}</span></div>
                                <div className="flex justify-between"><span>{t('totalPaid_portal')}:</span> <span className="font-medium text-green-600">{formatCurrency(totalPaid, settings.defaultCurrency)}</span></div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>{t('outstandingBalance')}:</span> <span>{formatCurrency(outstandingBalance, settings.defaultCurrency)}</span></div>
                            </div>
                        </Card>
                    </div>
                </header>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{t('invoices')}</h3>
                        <input
                            type="text"
                            placeholder={isRtl ? 'ابحث عن فاتورة...' : 'Search invoices...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm w-full max-w-xs"
                        />
                    </div>
                     <div className="overflow-x-auto">
                        <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600">{t('invoiceNumber')}</th>
                                    <th className="p-3 font-semibold text-slate-600">{t('issueDate')}</th>
                                    <th className="p-3 font-semibold text-slate-600">{t('dueDate')}</th>
                                    <th className="p-3 font-semibold text-slate-600 text-right">{t('amount')}</th>
                                    <th className="p-3 font-semibold text-slate-600 text-center">{t('status')}</th>
                                    <th className="p-3 font-semibold text-slate-600 text-center">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? filteredInvoices.map((invoice: Invoice) => {
                                     const publicInvoiceData = { invoice, settings, language };
                                     const encodedData = btoa(JSON.stringify(publicInvoiceData));
                                     const publicLink = `#/invoice/public/${encodedData}`;
                                     return (
                                        <tr key={invoice.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="p-3 font-medium text-indigo-600"><a href={publicLink} target="_blank">{invoice.invoiceNumber}</a></td>
                                            <td className="p-3 text-slate-800">{formatDate(invoice.issueDate)}</td>
                                            <td className="p-3 text-slate-500">{formatDate(invoice.dueDate)}</td>
                                            <td className="p-3 font-medium text-slate-800 text-right">{formatCurrency(invoice.total, invoice.currency)}</td>
                                            <td className="p-3 text-center"><StatusBadge status={invoice.status} /></td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a href={publicLink} target="_blank">
                                                        <Button variant="ghost" size="sm" aria-label={t('downloadPdf')} title={t('downloadPdf')}><DownloadIcon className="h-4 w-4" /></Button>
                                                    </a>
                                                     <Button variant="ghost" size="sm" onClick={() => openMessageModal(invoice)} aria-label={t('sendMessage')} title={t('sendMessage')}>
                                                        <MessageSquareIcon className="h-4 w-4"/>
                                                    </Button>
                                                    {invoice.status !== 'paid' && (
                                                        <Button size="sm">{t('payNow')}</Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                     )
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center p-6 text-slate-500">{t('noData')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <Modal 
                isOpen={isMessageModalOpen} 
                onClose={() => setMessageModalOpen(false)} 
                title={`${t('sendMessage')} - ${currentInvoiceForMessage?.invoiceNumber}`}
            >
                <div className="space-y-4">
                    <TextArea
                        label={t('typeYourMessage')}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        rows={6}
                        isRtl={isRtl}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSendMessage}>{t('send')}</Button>
                    </div>
                </div>
            </Modal>
            <Toast message={t('messageSentSuccess')} show={showToast} onClose={() => setShowToast(false)} />
        </div>
        </PublicContext.Provider>
    );
};

export default ClientPortal;


import React, { useContext, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { formatCurrency, formatDate, formatPhoneNumberForWhatsApp } from '../utils/formatters';
import { downloadPdf } from '../utils/pdf';
import { Button, Card, Modal, Input, TextArea } from './ui';
import { DownloadIcon, PrintIcon, SendIcon, SparklesIcon, EditIcon, WhatsAppIcon } from './icons';
import { generateInvoiceEmail } from '../services/geminiService';

const InvoiceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const context = useContext(AppContext);
    const navigate = useNavigate();

    const [isEmailModalOpen, setEmailModalOpen] = useState(false);
    const [emailContent, setEmailContent] = useState({ subject: '', body: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    
    const [isWhatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
    const [whatsAppContent, setWhatsAppContent] = useState({ phone: '', message: '' });

    if (!context || !id) return <div>Loading...</div>;
    const { getInvoiceById, settings, t, language, getExchangeRate } = context;

    const invoice = getInvoiceById(id);
    if (!invoice) return <div>Invoice not found</div>;
    
    const isRtl = language === 'ar';
    const isAutoEntrepreneur = settings.businessType === 'auto-entrepreneur';

    const exchangeRate = invoice.currency !== 'MAD' ? getExchangeRate(invoice.currency, 'MAD') : 1;
    const totalInMad = invoice.currency !== 'MAD' ? invoice.total * exchangeRate : invoice.total;

    const handlePrint = () => window.print();

    const handleOpenEmailModal = async () => {
        setEmailSent(false);
        setIsGenerating(true);
        setEmailModalOpen(true);
        const content = await generateInvoiceEmail(invoice, language);
        setEmailContent({
            subject: content.subject.replace('[Client Name]', invoice.customer.name).replace('[Your Company Name]', settings.name),
            body: content.body.replace('[Client Name]', invoice.customer.name).replace('[Your Company Name]', settings.name)
        });
        setIsGenerating(false);
    };

    const handleSendEmail = () => {
        // This is a simulation
        console.log("Sending email:", emailContent);
        setEmailSent(true);
        setTimeout(() => {
            setEmailModalOpen(false);
        }, 2000);
    };

    const handleOpenWhatsAppModal = () => {
        const publicInvoiceData = {
            invoice,
            settings,
            language
        };
        const jsonString = JSON.stringify(publicInvoiceData);
        const encodedData = btoa(jsonString); // Base64 encoding for URL safety
        const publicLink = `${window.location.origin}${window.location.pathname}#/invoice/public/${encodedData}`;

        let messageTemplate = t('whatsAppMessageTemplate');
        messageTemplate = messageTemplate
            .replace('{clientName}', invoice.customer.name)
            .replace('{invoiceNumber}', invoice.invoiceNumber)
            .replace('{totalAmount}', formatCurrency(invoice.total, invoice.currency))
            .replace('{invoiceLink}', publicLink)
            .replace('{companyName}', settings.name);

        setWhatsAppContent({
            phone: invoice.customer.phone,
            message: messageTemplate
        });
        setWhatsAppModalOpen(true);
    };
    
    const handleSendWhatsApp = () => {
        const formattedPhone = formatPhoneNumberForWhatsApp(whatsAppContent.phone);
        if (!formattedPhone) {
            alert("Invalid phone number.");
            return;
        }
        const encodedMessage = encodeURIComponent(whatsAppContent.message);
        const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        
        window.open(url, '_blank', 'noopener,noreferrer');
        setWhatsAppModalOpen(false);
    };


    const StatusBadge = ({ status, text }: { status: string, text: string }) => {
        const statusClasses: { [key: string]: string } = {
            draft: 'border-slate-500 text-slate-500',
            sent: 'border-blue-500 text-blue-500',
            paid: 'border-green-500 text-green-500',
            overdue: 'border-yellow-500 text-yellow-500',
        };
        return <div className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 ${statusClasses[status]} rounded-[var(--border-radius-lg)]`}>{text}</div>
    }

    return (
        <>
            <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('invoice')} {invoice.invoiceNumber}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => navigate(`/app/invoice/edit/${id}`)}><EditIcon className="w-4 h-4" />{t('edit')}</Button>
                        <Button variant="secondary" onClick={() => downloadPdf('invoice-content', `Invoice-${invoice.invoiceNumber}`)}><DownloadIcon className="w-4 h-4" />{t('downloadPdf')}</Button>
                        <Button variant="secondary" onClick={handlePrint}><PrintIcon className="w-4 h-4" />{t('print')}</Button>
                        <Button variant="secondary" onClick={handleOpenEmailModal}><SendIcon className="w-4 h-4" />{t('sendByEmail')}</Button>
                        <Button onClick={handleOpenWhatsAppModal} className="bg-green-500 hover:bg-green-600 focus:ring-green-500"><WhatsAppIcon className="w-4 h-4" />{t('sendByWhatsApp')}</Button>
                    </div>
                </div>

                <div id="invoice-content" className={`bg-white shadow-lg rounded-[var(--border-radius-xl)] p-8 md:p-12 ${isRtl ? 'rtl' : ''}`}>
                    <header className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b">
                        <div className={` ${isRtl ? 'text-right' : 'text-left'}`}>
                            {settings.logo ? <img src={settings.logo} alt="company logo" className="h-20 mb-4" /> : <h1 className="text-3xl font-bold text-slate-800">{settings.name}</h1>}
                            <p className="text-slate-600">{settings.address}</p>
                            <p className="text-slate-600">{settings.phone}</p>
                            <p className="text-slate-600">{settings.email}</p>
                        </div>
                        <div className={`mt-4 sm:mt-0 ${isRtl ? 'text-left' : 'text-right'}`}>
                            <h2 className="text-4xl font-bold uppercase text-slate-800">{t('invoice')}</h2>
                            <p className="text-slate-600 mt-2"><span className="font-semibold">{t('invoiceNumber')}:</span> {invoice.invoiceNumber}</p>
                            <p className="text-slate-600"><span className="font-semibold">{t('issueDate')}:</span> {formatDate(invoice.issueDate)}</p>
                            <p className="text-slate-600"><span className="font-semibold">{t('dueDate')}:</span> {formatDate(invoice.dueDate)}</p>
                        </div>
                    </header>

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8">
                        <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
                            <h3 className="text-sm font-semibold uppercase text-slate-500 mb-2">{t('from')}</h3>
                            <p className="font-bold text-slate-800">{settings.name}</p>
                            {!isAutoEntrepreneur && (
                                <>
                                <p className="text-slate-600">IF: {settings.iff}</p>
                                <p className="text-slate-600">ICE: {settings.ice}</p>
                                <p className="text-slate-600">RC: {settings.rc}</p>
                                </>
                            )}
                        </div>
                         <div className={`${isRtl ? 'text-right' : 'text-left sm:text-right'}`}>
                            <h3 className="text-sm font-semibold uppercase text-slate-500 mb-2">{t('to')}</h3>
                            <p className="font-bold text-slate-800">{invoice.customer.name}</p>
                            <p className="text-slate-600">{invoice.customer.address}</p>
                            <p className="text-slate-600">{invoice.customer.email}</p>
                            {invoice.customer.cin && <p className="text-slate-600">CIN: {invoice.customer.cin}</p>}
                            {invoice.customer.ice && <p className="text-slate-600">ICE: {invoice.customer.ice}</p>}
                        </div>
                    </section>

                    <section>
                        <table className={`w-full ${isRtl ? 'text-right' : 'text-left'}`}>
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-700">{t('description')}</th>
                                    <th className="p-3 font-semibold text-slate-700 text-center">{t('quantity')}</th>
                                    <th className="p-3 font-semibold text-slate-700 text-right">{t('price')}</th>
                                    <th className="p-3 font-semibold text-slate-700 text-right">{t('total')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map(item => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.price, invoice.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    
                    <section className="flex justify-end mt-8">
                        <div className="w-full sm:w-1/2 md:w-2/5 space-y-4">
                             <div className="flex justify-between">
                                <span className="text-slate-600">{t('subtotal')}</span>
                                <span className="font-medium">{formatCurrency(invoice.subTotal, invoice.currency)}</span>
                             </div>
                             {!isAutoEntrepreneur && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">{t('taxAmount')} (TVA)</span>
                                    <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                                </div>
                             )}
                             <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t">
                                <span>{t('grandTotal')}</span>
                                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
                             </div>
                             {invoice.currency !== 'MAD' && (
                                <div className="flex justify-between text-md font-bold text-slate-500 pt-2 border-t">
                                    <span>(Total en MAD)</span>
                                    <span>{formatCurrency(totalInMad, 'MAD')}</span>
                                </div>
                             )}
                        </div>
                    </section>

                    <footer className="mt-12 pt-8 border-t text-center">
                       <div className="mb-4"> <StatusBadge status={invoice.status} text={t(invoice.status)} /></div>
                        {invoice.notes && <p className="text-sm text-slate-600 mb-4">{t('notes')}: {invoice.notes}</p>}
                         {invoice.currency !== 'MAD' && (
                            <p className="text-xs text-slate-500 mb-4">
                                {t('exchangeRateNote')
                                .replace('{from}', invoice.currency)
                                .replace('{to}', 'MAD')
                                .replace('{date}', formatDate(invoice.issueDate))
                                .replace('{rate}', exchangeRate.toFixed(4))}
                            </p>
                        )}
                        {isAutoEntrepreneur && (
                            <p className="text-xs text-slate-500 mb-4 font-semibold">{t('tvaNotApplicable')}</p>
                        )}
                        <p className="text-sm text-slate-500">{settings.name}.</p>
                    </footer>
                </div>
            </div>

            <Modal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} title={t('sendByEmail')}>
                {isGenerating ? (
                    <div className="flex items-center justify-center h-48">
                        <SparklesIcon className="w-6 h-6 animate-pulse text-indigo-500 mr-2" />
                        <p className="text-slate-600 dark:text-slate-300">{t('generating')}...</p>
                    </div>
                ) : emailSent ? (
                     <div className="flex items-center justify-center h-48 flex-col">
                        <SendIcon className="w-12 h-12 text-green-500 mb-4" />
                        <p className="text-slate-800 dark:text-slate-100 font-semibold">{t('emailSentSuccess')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input label={t('invoiceEmailSubject')} value={emailContent.subject} onChange={e => setEmailContent(p => ({ ...p, subject: e.target.value }))} isRtl={isRtl} />
                        <TextArea label={t('invoiceEmailBody')} value={emailContent.body} onChange={e => setEmailContent(p => ({ ...p, body: e.target.value }))} rows={8} isRtl={isRtl}/>
                        <div className="flex justify-end">
                            <Button onClick={handleSendEmail}><SendIcon className="w-4 h-4"/>{t('sendEmail')}</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isWhatsAppModalOpen} onClose={() => setWhatsAppModalOpen(false)} title={t('whatsAppModalTitle')}>
                <div className="space-y-4">
                    <Input 
                        label={t('clientPhoneNumber')} 
                        value={whatsAppContent.phone}
                        onChange={e => setWhatsAppContent(p => ({ ...p, phone: e.target.value }))}
                        isRtl={isRtl} 
                    />
                    <TextArea 
                        label={t('whatsAppMessage')} 
                        value={whatsAppContent.message}
                        onChange={e => setWhatsAppContent(p => ({ ...p, message: e.target.value }))}
                        rows={10} 
                        isRtl={isRtl}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSendWhatsApp} className="bg-green-500 hover:bg-green-600 focus:ring-green-500"><WhatsAppIcon className="w-4 h-4"/>{t('send')}</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default InvoiceView;

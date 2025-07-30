
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Invoice, CompanySettings, Language } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TRANSLATIONS } from '../constants';

interface PublicInvoiceData {
    invoice: Invoice;
    settings: CompanySettings;
    language: Language;
}

const PublicInvoiceView: React.FC = () => {
    const { data: encodedData } = useParams<{ data: string }>();
    const [publicData, setPublicData] = useState<PublicInvoiceData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // This is a simplified mock for the public view. In a real app, this might be fetched or passed differently.
    const MOCK_RATES: { [key: string]: number } = { 'EUR_MAD': 10.95, 'USD_MAD': 9.85 };

    useEffect(() => {
        if (encodedData) {
            try {
                const decodedJson = atob(encodedData);
                const parsedData = JSON.parse(decodedJson);
                if (parsedData.invoice && parsedData.settings && parsedData.language) {
                    setPublicData(parsedData);
                    document.documentElement.lang = parsedData.language;
                    document.documentElement.dir = parsedData.language === 'ar' ? 'rtl' : 'ltr';
                    document.body.className = `bg-slate-50 ${parsedData.language === 'ar' ? 'font-cairo' : 'font-sans'}`;
                } else {
                    throw new Error("Invalid data structure in URL.");
                }
            } catch (e) {
                console.error("Failed to decode or parse invoice data:", e);
                setError("Could not load the invoice. The link may be invalid or expired.");
            }
        }
    }, [encodedData]);

    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!publicData) return <div className="p-8 text-center">Loading invoice...</div>;

    const { invoice, settings, language } = publicData;
    const isRtl = language === 'ar';
    const isAutoEntrepreneur = settings.businessType === 'auto-entrepreneur';
    const t = (key: string): string => TRANSLATIONS[language]?.[key] || key;
    
    const exchangeRate = invoice.currency !== 'MAD' ? (MOCK_RATES[`${invoice.currency}_MAD`] || 1) : 1;
    const totalInMad = invoice.currency !== 'MAD' ? invoice.total * exchangeRate : invoice.total;

    const StatusBadge = ({ status, text }: { status: string, text: string }) => {
        const statusClasses: { [key: string]: string } = {
            draft: 'border-slate-500 text-slate-500',
            sent: 'border-blue-500 text-blue-500',
            paid: 'border-green-500 text-green-500',
            overdue: 'border-yellow-500 text-yellow-500',
        };
        return <div className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border-2 ${statusClasses[status]} rounded-lg`}>{text}</div>
    }

    return (
        <div className="max-w-4xl mx-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div id="invoice-content" className={`bg-white shadow-lg rounded-lg p-8 md:p-12 ${isRtl ? 'rtl' : ''}`}>
                <header className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b">
                    <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
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
    );
};

export default PublicInvoiceView;

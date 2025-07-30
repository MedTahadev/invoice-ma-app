
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Invoice, InvoiceItem, Client, InvoiceStatus, Currency } from '../types';
import { Card, Input, TextArea, Select, Button } from './ui';
import { TrashIcon, PlusIcon, SparklesIcon, LockIcon } from './icons';
import { generateItemDescription } from '../services/geminiService';
import { formatDate } from '../utils/formatters';

const InvoiceForm: React.FC = () => {
    const context = useContext(AppContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    if (!context) return null;
    const { getInvoiceById, addInvoice, updateInvoice, getNextInvoiceNumber, settings, t, language, currentUser, clients, getExchangeRate } = context;

    const isEditing = Boolean(id);
    const isRtl = language === 'ar';
    const isAutoEntrepreneur = settings.businessType === 'auto-entrepreneur';
    
    const EMPTY_CLIENT: Client = { id: '', name: '', email: '', phone: '', address: '', cin: '', ice: '' };

    const getInitialInvoiceState = (): Invoice => {
        if (isEditing && id) {
            const existingInvoice = getInvoiceById(id);
            if (existingInvoice) return existingInvoice;
        }
        
        const defaultTaxRate = isAutoEntrepreneur ? 0 : settings.defaultTaxRate;
        
        return {
            id: isEditing && id ? id : Date.now().toString(),
            invoiceNumber: getNextInvoiceNumber(),
            customer: EMPTY_CLIENT,
            items: [{ id: Date.now().toString(), description: '', quantity: 1, price: 0, taxRate: defaultTaxRate }],
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
            status: 'draft',
            currency: settings.defaultCurrency,
            notes: settings.defaultNotes,
            subTotal: 0,
            taxAmount: 0,
            total: 0,
            editCount: 0,
        };
    };

    const [invoice, setInvoice] = useState<Invoice>(getInitialInvoiceState);
    const [generatingAi, setGeneratingAi] = useState<string | null>(null);
    const [formError, setFormError] = useState('');
    const [exchangeRate, setExchangeRate] = useState(1);

    useEffect(() => {
        const subTotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const taxAmount = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price * (isAutoEntrepreneur ? 0 : item.taxRate) / 100), 0);
        setInvoice(prev => ({ ...prev, subTotal, taxAmount, total: subTotal + taxAmount }));
    }, [invoice.items, isAutoEntrepreneur]);

     useEffect(() => {
        if (invoice.currency !== 'MAD') {
            setExchangeRate(getExchangeRate(invoice.currency, 'MAD'));
        } else {
            setExchangeRate(1);
        }
    }, [invoice.currency, getExchangeRate]);


    const handleClientSelect = (clientId: string) => {
        const selectedClient = clients.find(c => c.id === clientId) || EMPTY_CLIENT;
        setInvoice(prev => ({...prev, customer: selectedClient}));
    };

    const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
        }));
    };

    const handleGenerateDescription = async (itemId: string, itemName: string) => {
        if (!itemName) return;
        setGeneratingAi(itemId);
        try {
            const description = await generateItemDescription(itemName, language);
            handleItemChange(itemId, 'description', description);
        } catch (error) {
            console.error(error);
        } finally {
            setGeneratingAi(null);
        }
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, price: 0, taxRate: isAutoEntrepreneur ? 0 : settings.defaultTaxRate }]
        }));
    };

    const removeItem = (itemId: string) => {
        setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if(!invoice.customer.id) {
            setFormError(isRtl ? 'الرجاء اختيار عميل' : 'Please select a client');
            return;
        }

        let result: { success: boolean, message: string };
        if (isEditing) {
            result = await updateInvoice(invoice);
        } else {
            result = await addInvoice(invoice);
        }

        if (result.success) {
            navigate('/app');
        } else {
            setFormError(result.message);
        }
    };
    
    const gridColsClass = isAutoEntrepreneur ? 'grid-cols-[2fr_1fr_1fr_1fr_auto]' : 'grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{isEditing ? t('editInvoice') : t('createInvoice')}</h1>
            
            {isEditing && (
                <Card className={`border-l-4 ${invoice.editCount === 0 ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'} !p-4`}>
                    <div className="flex flex-col">
                        <p className={`font-semibold ${invoice.editCount === 0 ? 'text-blue-800 dark:text-blue-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                            {invoice.editCount === 0 
                                ? t('editCostFree') 
                                : t('editCostCharged').replace('{credits}', String(currentUser?.credits || 0))}
                        </p>
                    </div>
                </Card>
            )}

            {formError && (
                <Card className="border-l-4 border-red-400 bg-red-50 dark:bg-red-900/20 !p-4">
                    <p className="font-semibold text-red-800 dark:text-red-300">{formError}</p>
                </Card>
            )}

            <Card>
                <h2 className={`text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700 ${isRtl && 'text-right'}`}>{t('billTo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <Select id="customer" name="customer" label={t('selectClient')} onChange={e => handleClientSelect(e.target.value)} value={invoice.customer.id} isRtl={isRtl} required>
                        <option value="" disabled>{t('selectClient')}</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </Select>
                    <Button type="button" variant="secondary" onClick={() => navigate('/app/client/new')} className="mb-1">
                        <PlusIcon className="h-4 w-4"/> {t('newClient')}
                    </Button>
                </div>
                 {invoice.customer.id && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-[var(--border-radius-lg)] border dark:border-slate-700 text-sm">
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientName')}:</strong> {invoice.customer.name}</p>
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientEmail')}:</strong> {invoice.customer.email}</p>
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientPhone')}:</strong> {invoice.customer.phone}</p>
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientAddress')}:</strong> {invoice.customer.address}</p>
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientCin')}:</strong> {invoice.customer.cin}</p>
                        <p><strong className="font-semibold text-slate-700 dark:text-slate-300">{t('clientIce')}:</strong> {invoice.customer.ice}</p>
                    </div>
                )}
            </Card>

            <Card>
                <h2 className={`text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700 ${isRtl && 'text-right'}`}>{t('invoiceDetails')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="relative">
                       <Input 
                            id="invoiceNumber" 
                            name="invoiceNumber" 
                            label={t('invoiceNumber')} 
                            value={invoice.invoiceNumber} 
                            onChange={handleInvoiceChange} 
                            readOnly={isEditing} 
                            isRtl={isRtl}
                            className={isEditing ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed' : ''}
                        />
                        {isEditing && (
                            <span className="absolute top-1 right-2 h-full flex items-center pr-3" title={t('invoiceNumberReadonly')}>
                                <LockIcon className="h-4 w-4 text-slate-400" />
                            </span>
                        )}
                    </div>
                    <Input id="issueDate" name="issueDate" type="date" label={t('issueDate')} value={invoice.issueDate} onChange={handleInvoiceChange} required isRtl={isRtl} />
                    <Input id="dueDate" name="dueDate" type="date" label={t('dueDate')} value={invoice.dueDate} onChange={handleInvoiceChange} required isRtl={isRtl} />
                    <Select id="status" name="status" label={t('status')} value={invoice.status} onChange={handleInvoiceChange} isRtl={isRtl}>
                        <option value="draft">{t('status_draft')}</option>
                        <option value="sent">{t('status_sent')}</option>
                        <option value="paid">{t('status_paid')}</option>
                        <option value="overdue">{t('status_overdue')}</option>
                    </Select>
                     <Select id="currency" name="currency" label={t('currency')} value={invoice.currency} onChange={handleInvoiceChange} isRtl={isRtl}>
                        <option value="MAD">MAD</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                    </Select>
                    {invoice.currency !== 'MAD' && (
                        <div className="md:col-span-3 p-3 bg-blue-50 dark:bg-slate-800/50 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                           {t('exchangeRateNote')
                                .replace('{from}', invoice.currency)
                                .replace('{to}', 'MAD')
                                .replace('{date}', formatDate(new Date().toISOString()))
                                .replace('{rate}', exchangeRate.toFixed(4))}
                        </div>
                    )}
                </div>
            </Card>

            <Card>
                 <h2 className={`text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 ${isRtl && 'text-right'}`}>{t('items')}</h2>
                <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                        <div className={`grid gap-4 items-center mb-2 p-2 font-semibold text-slate-600 dark:text-slate-300 ${gridColsClass} ${isRtl ? 'text-right' : ''}`}>
                            <div>{t('description')}</div>
                            <div>{t('quantity')}</div>
                            <div>{t('price')}</div>
                            {!isAutoEntrepreneur && <div>{t('tax')}</div>}
                            <div>{t('total')}</div>
                            <div></div>
                        </div>
                        {invoice.items.map(item => (
                            <div key={item.id} className={`grid gap-4 items-start mb-2 p-2 rounded-[var(--border-radius-lg)] border border-slate-200 dark:border-slate-700 ${gridColsClass} ${isRtl ? 'text-right' : ''}`}>
                                <div className="flex flex-col">
                                    <TextArea
                                        value={item.description}
                                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                        placeholder={t('description')}
                                        rows={2}
                                        className="w-full text-sm"
                                        label=""
                                        isRtl={isRtl}
                                    />
                                    <Button type="button" variant="ghost" className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 self-start" onClick={() => handleGenerateDescription(item.id, item.description)} disabled={generatingAi === item.id}>
                                        <SparklesIcon className="w-3 h-3"/>
                                        {generatingAi === item.id ? t('generating') : t('generateWithAI')}
                                    </Button>
                                </div>
                                <Input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full" label="" isRtl={isRtl}/>
                                <Input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full" label="" isRtl={isRtl}/>
                                {!isAutoEntrepreneur && <Input type="number" value={item.taxRate} onChange={e => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)} className="w-full" label="" isRtl={isRtl}/>}
                                <div className="flex items-center justify-end h-full font-medium text-slate-800 dark:text-slate-100">{((item.quantity * item.price) * (1 + (isAutoEntrepreneur ? 0 : item.taxRate) / 100)).toFixed(2)}</div>
                                <Button type="button" variant="ghost" onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 h-10 w-10 p-0" disabled={invoice.items.length <= 1}><TrashIcon className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </div>
                </div>
                <Button type="button" variant="secondary" onClick={addItem} className="mt-4"><PlusIcon className="h-4 w-4"/>{t('addItem')}</Button>
            </Card>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <TextArea name="notes" label={t('notes')} value={invoice.notes || ''} onChange={handleInvoiceChange} rows={4} isRtl={isRtl}/>
                </div>
                <Card className="flex-shrink-0 md:w-1/3">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-300">{t('subtotal')}</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{invoice.subTotal.toFixed(2)} {invoice.currency}</span>
                        </div>
                        {!isAutoEntrepreneur && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-300">{t('taxAmount')}</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{invoice.taxAmount.toFixed(2)} {invoice.currency}</span>
                            </div>
                        )}
                        <div className="border-t dark:border-slate-700 pt-4 mt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{t('grandTotal')}</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-white">{invoice.total.toFixed(2)} {invoice.currency}</span>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" disabled={!invoice.customer.id}>{t('saveInvoice')}</Button>
            </div>
        </form>
    );
};

export default InvoiceForm;


import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Input } from './ui';
import { DownloadIcon } from './icons';
import { exportToCsv } from '../utils/csvExporter';
import { formatDate, formatCurrency } from '../utils/formatters';

const TvaDeclaration: React.FC = () => {
    const { invoices, settings, t, language } = useContext(AppContext)!;
    const isRtl = language === 'ar';
    const [period, setPeriod] = useState({
        start: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 - 3, 1).toISOString().split('T')[0],
        end: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 0).toISOString().split('T')[0]
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeriod(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const salesReportData = useMemo(() => {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        
        return invoices
            .filter(inv => {
                const issueDate = new Date(inv.issueDate);
                return issueDate >= startDate && issueDate <= endDate;
            })
            .map(inv => ({
                'Numero Facture': inv.invoiceNumber,
                'Date Emission': formatDate(inv.issueDate),
                'Nom Client': inv.customer.name,
                'ICE Client': inv.customer.ice,
                'Sous-Total': inv.subTotal.toFixed(2),
                'Montant TVA': inv.taxAmount.toFixed(2),
                'Total TTC': inv.total.toFixed(2),
                'Devise': inv.currency,
            }));
    }, [invoices, period]);

    const collectionsReportData = useMemo(() => {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);

        return invoices
            .filter(inv => {
                if (!inv.paymentDate) return false;
                const paymentDate = new Date(inv.paymentDate);
                return paymentDate >= startDate && paymentDate <= endDate;
            })
            .map(inv => ({
                'Numero Facture': inv.invoiceNumber,
                'Date Paiement': formatDate(inv.paymentDate!),
                'Nom Client': inv.customer.name,
                'ICE Client': inv.customer.ice,
                'Total Encaisse': inv.total.toFixed(2),
                'Montant TVA': inv.taxAmount.toFixed(2),
                'Devise': inv.currency,
            }));
    }, [invoices, period]);
    
    const handleExportSales = () => {
        exportToCsv(salesReportData, `Rapport_Ventes_${period.start}_${period.end}`);
    };
    
    const handleExportCollections = () => {
        exportToCsv(collectionsReportData, `Rapport_Encaissements_${period.start}_${period.end}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t('tvaDeclaration')}</h1>
            
            <Card>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 pb-4 border-b dark:border-slate-700">{t('selectPeriod')}</h2>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <Input type="date" name="start" label={t('startDate')} value={period.start} onChange={handleDateChange} isRtl={isRtl} />
                    <Input type="date" name="end" label={t('endDate')} value={period.end} onChange={handleDateChange} isRtl={isRtl} />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                     <Button onClick={handleExportSales} disabled={salesReportData.length === 0}>
                        <DownloadIcon className="h-4 w-4" />
                        {t('exportSalesReport')}
                     </Button>
                     <Button onClick={handleExportCollections} disabled={collectionsReportData.length === 0}>
                        <DownloadIcon className="h-4 w-4" />
                        {t('exportCollectionsReport')}
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold mb-2">Aperçu - Rapport des Ventes</h3>
                    <p className="text-sm text-slate-500 mb-4">{salesReportData.length} factures émises dans cette période.</p>
                     <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left font-semibold">N° Facture</th>
                                    <th className="p-2 text-left font-semibold">Date</th>
                                    <th className="p-2 text-left font-semibold">Client</th>
                                    <th className="p-2 text-right font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesReportData.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="border-t dark:border-slate-700">
                                        <td className="p-2">{row['Numero Facture']}</td>
                                        <td className="p-2">{row['Date Emission']}</td>
                                        <td className="p-2 truncate">{row['Nom Client']}</td>
                                        <td className="p-2 text-right">{formatCurrency(parseFloat(row['Total TTC']), settings.defaultCurrency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-lg font-bold mb-2">Aperçu - Rapport des Encaissements</h3>
                    <p className="text-sm text-slate-500 mb-4">{collectionsReportData.length} factures encaissées dans cette période.</p>
                     <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left font-semibold">N° Facture</th>
                                    <th className="p-2 text-left font-semibold">Date</th>
                                    <th className="p-2 text-left font-semibold">Client</th>
                                    <th className="p-2 text-right font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collectionsReportData.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="border-t dark:border-slate-700">
                                        <td className="p-2">{row['Numero Facture']}</td>
                                        <td className="p-2">{row['Date Paiement']}</td>
                                        <td className="p-2 truncate">{row['Nom Client']}</td>
                                        <td className="p-2 text-right">{formatCurrency(parseFloat(row['Total Encaisse']), settings.defaultCurrency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

        </div>
    );
};

export default TvaDeclaration;

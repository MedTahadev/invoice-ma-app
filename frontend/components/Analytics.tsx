
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Input } from './ui';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUpIcon, LandmarkIcon, UsersIcon, DollarSignIcon } from './icons';
import { Invoice } from '../types';

// Sub-component for Cash Flow Forecast
const CashFlowForecast: React.FC = () => {
    const { invoices, t, language, settings } = useContext(AppContext)!;
    const [days, setDays] = useState(30);

    const forecastData = useMemo(() => {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + days);

        const relevantInvoices = invoices.filter(inv => 
            (inv.status === 'sent' || inv.status === 'overdue') && new Date(inv.dueDate) <= endDate
        );

        const dailyIncome: { [key: string]: number } = {};
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            dailyIncome[date.toISOString().split('T')[0]] = 0;
        }

        relevantInvoices.forEach(inv => {
            const dueDateStr = inv.dueDate;
            if (dailyIncome[dueDateStr] !== undefined) {
                dailyIncome[dueDateStr] += inv.total;
            }
        });

        return Object.entries(dailyIncome).map(([date, total]) => ({ date, total }));
    }, [days, invoices]);

    const maxValue = Math.max(...forecastData.map(d => d.total), 0);
    const hasData = forecastData.some(d => d.total > 0);

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUpIcon className="h-6 w-6" />
                    {t('cashFlowForecast')}
                </h2>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    {[30, 60, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-sm rounded-md transition-colors ${days === d ? 'bg-white dark:bg-slate-600 shadow-sm font-semibold' : 'hover:bg-slate-200 dark:hover:bg-slate-600/50'}`}>
                           {t(`next${d}days`)}
                        </button>
                    ))}
                </div>
            </div>
            {hasData ? (
                 <div className="w-full h-64 overflow-x-auto">
                    <div className="flex items-end h-full gap-2 pr-4" style={{width: `${forecastData.length * 2.5}rem`}}>
                        {forecastData.map(({ date, total }) => (
                            <div key={date} className="flex-1 flex flex-col items-center group relative" title={`${formatDate(date)}: ${formatCurrency(total, settings.defaultCurrency)}`}>
                                <div className="text-xs text-slate-400 absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{formatCurrency(total, settings.defaultCurrency)}</div>
                                <div 
                                    className="w-full bg-indigo-200 dark:bg-indigo-700/50 rounded-t-md hover:bg-[var(--color-primary-500)]"
                                    style={{ height: `${total > 0 ? Math.max(5, (total / maxValue) * 100) : 0}%` }}
                                ></div>
                                <div className="text-xs text-slate-400 mt-1 whitespace-nowrap transform -rotate-45">{formatDate(date).substring(0,5)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex items-center justify-center text-slate-500">{t('noUpcomingIncome')}</div>
            )}
        </Card>
    );
};

// Sub-component for TVA Collection Report
const TvaReport: React.FC = () => {
    const { invoices, t, language, settings } = useContext(AppContext)!;
    const isRtl = language === 'ar';
    const [period, setPeriod] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeriod(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const reportData = useMemo(() => {
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        
        const invoiced = invoices.filter(inv => {
            const issueDate = new Date(inv.issueDate);
            return issueDate >= startDate && issueDate <= endDate;
        });

        const collected = invoices.filter(inv => {
            if (!inv.paymentDate) return false;
            const paymentDate = new Date(inv.paymentDate);
            return paymentDate >= startDate && paymentDate <= endDate;
        });

        const totalInvoicedTVA = invoiced.reduce((sum, inv) => sum + inv.taxAmount, 0);
        const totalCollectedTVA = collected.reduce((sum, inv) => sum + inv.taxAmount, 0);

        return { totalInvoicedTVA, totalCollectedTVA };
    }, [invoices, period]);

    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <LandmarkIcon className="h-6 w-6" />
                {t('tvaCollectionReport')}
            </h2>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input type="date" name="start" label={t('startDate')} value={period.start} onChange={handleDateChange} isRtl={isRtl} />
                <Input type="date" name="end" label={t('endDate')} value={period.end} onChange={handleDateChange} isRtl={isRtl} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm text-slate-500">{t('totalInvoicedTVA')}</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(reportData.totalInvoicedTVA, settings.defaultCurrency)}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">{t('totalCollectedTVA')}</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(reportData.totalCollectedTVA, settings.defaultCurrency)}</p>
                </div>
            </div>
        </Card>
    );
};

// Sub-component for Performance Dashboard
const PerformanceDashboard: React.FC = () => {
    const { invoices, clients, t, settings } = useContext(AppContext)!;

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');

    const topClients = useMemo(() => {
        const clientRevenue: { [id: string]: number } = {};
        paidInvoices.forEach(inv => {
            clientRevenue[inv.customer.id] = (clientRevenue[inv.customer.id] || 0) + inv.total;
        });
        return Object.entries(clientRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, total]) => ({ client: clients.find(c => c.id === id), total }));
    }, [paidInvoices, clients]);

    const topServices = useMemo(() => {
        const serviceRevenue: { [desc: string]: number } = {};
        paidInvoices.forEach(inv => {
            inv.items.forEach(item => {
                const desc = item.description.trim() || t('serviceDescription');
                serviceRevenue[desc] = (serviceRevenue[desc] || 0) + (item.price * item.quantity);
            });
        });
        return Object.entries(serviceRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([description, total]) => ({ description, total }));
    }, [paidInvoices, t]);

    const paymentHabits = useMemo(() => {
        const habits: { [id: string]: { totalDays: number, count: number } } = {};
        paidInvoices.forEach(inv => {
            if (inv.paymentDate) {
                const dueDate = new Date(inv.dueDate);
                const paymentDate = new Date(inv.paymentDate);
                const diffTime = paymentDate.getTime() - dueDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (!habits[inv.customer.id]) {
                    habits[inv.customer.id] = { totalDays: 0, count: 0 };
                }
                habits[inv.customer.id].totalDays += diffDays;
                habits[inv.customer.id].count += 1;
            }
        });
        return Object.entries(habits).map(([id, data]) => ({
            client: clients.find(c => c.id === id),
            avgDays: Math.round(data.totalDays / data.count)
        }));
    }, [paidInvoices, clients]);

    const renderAvgDays = (days: number) => {
        if (days <= 0) {
            return <span className="text-green-600">{days === 0 ? t('paidOnTime') : `${-days} ${t('paidEarly')}`}</span>
        }
        return <span className="text-red-600">{`${days} ${t('daysLate')}`}</span>
    }
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800 mb-6">{t('performanceDashboard')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><UsersIcon className="h-5 w-5"/>{t('topClients')}</h3>
                    <ul className="space-y-2">
                        {topClients.map(({ client, total }) => client && (
                           <li key={client.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                               <span>{client.name}</span>
                               <span className="font-bold">{formatCurrency(total, settings.defaultCurrency)}</span>
                           </li>
                        ))}
                         {topClients.length === 0 && <p className="text-sm text-slate-500">{t('noData')}</p>}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><DollarSignIcon className="h-5 w-5"/>{t('topProductsServices')}</h3>
                    <ul className="space-y-2">
                        {topServices.map(({ description, total }) => (
                           <li key={description} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                               <span className="truncate" title={description}>{description}</span>
                               <span className="font-bold flex-shrink-0 ml-2">{formatCurrency(total, settings.defaultCurrency)}</span>
                           </li>
                        ))}
                        {topServices.length === 0 && <p className="text-sm text-slate-500">{t('noData')}</p>}
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">{t('clientPaymentHabits')}</h3>
                    <ul className="space-y-2">
                        {paymentHabits.map(({ client, avgDays }) => client && (
                           <li key={client.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md">
                               <span>{client.name}</span>
                               <span className="font-bold">{renderAvgDays(avgDays)}</span>
                           </li>
                        ))}
                         {paymentHabits.length === 0 && <p className="text-sm text-slate-500">{t('noData')}</p>}
                    </ul>
                </div>
            </div>
        </Card>
    );
};


const Analytics: React.FC = () => {
    const { t } = useContext(AppContext)!;
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">{t('analytics')}</h1>
            <CashFlowForecast />
            <TvaReport />
            <PerformanceDashboard />
        </div>
    );
};

export default Analytics;

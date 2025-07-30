
import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Button, Card } from './ui';
import { ShieldIcon, GlobeIcon, FileTextIcon, SparklesIcon, UsersIcon, CheckCircleIcon, BarChart2Icon, TrendingUpIcon, LandmarkIcon, MessageSquareIcon } from './icons';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[var(--border-radius-xl)]">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-[var(--color-primary-500)] mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{description}</p>
    </div>
);

const AdvancedFeatureItem: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({icon, title, desc}) => (
    <li className="flex gap-4 items-start">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-[var(--color-primary-500)] flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
    </li>
);

const Home: React.FC = () => {
    const context = useContext(AppContext);
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [hash]);

    if (!context) return null;
    const { t, language } = context;
    const isRtl = language === 'ar';

    return (
        <div className={`bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 ${isRtl ? 'font-cairo' : 'font-sans'}`}>
            {/* Hero Section */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-50 !leading-tight">
                        {t('heroTitle')}
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        {t('heroSubtitle')}
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/register">
                            <Button size="lg">{t('getStarted')}</Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="secondary">{t('login')}</Button>
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section id="features" className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<ShieldIcon className="w-6 h-6"/>} title={t('feature1Title')} description={t('feature1Desc')} />
                        <FeatureCard icon={<GlobeIcon className="w-6 h-6"/>} title={t('feature2Title')} description={t('feature2Desc')} />
                        <FeatureCard icon={<FileTextIcon className="w-6 h-6"/>} title={t('feature3Title')} description={t('feature3Desc')} />
                        <FeatureCard icon={<SparklesIcon className="w-6 h-6"/>} title={t('feature4Title')} description={t('feature4Desc')} />
                        <FeatureCard icon={<UsersIcon className="w-6 h-6"/>} title={t('feature5Title')} description={t('feature5Desc')} />
                        <FeatureCard icon={<CheckCircleIcon className="w-6 h-6"/>} title={t('feature6Title')} description={t('feature6Desc')} />
                    </div>
                </div>
            </section>
            
            {/* Advanced Features Section */}
             <section id="advanced-features" className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">Allez plus loin avec des outils avancés</h2>
                         <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Prenez des décisions éclairées et améliorez vos relations clients.</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                       <div className="space-y-8">
                            <h3 className="text-2xl font-semibold text-center lg:text-left">Reporting & Analyses Avancées</h3>
                            <ul className="space-y-6">
                               <AdvancedFeatureItem icon={<TrendingUpIcon className="w-5 h-5"/>} title="Prévision de Trésorerie" desc="Anticipez vos futurs revenus avec une projection visuelle basée sur vos factures impayées." />
                               <AdvancedFeatureItem icon={<LandmarkIcon className="w-5 h-5"/>} title="Rapport de Collecte TVA" desc="Visualisez la TVA facturée vs. la TVA encaissée pour des déclarations fiscales précises et sans stress." />
                               <AdvancedFeatureItem icon={<BarChart2Icon className="w-5 h-5"/>} title="Tableau de Bord de Performance" desc="Identifiez vos meilleurs clients, vos services les plus rentables et les habitudes de paiement." />
                            </ul>
                       </div>
                       <div className="space-y-8">
                            <h3 className="text-2xl font-semibold text-center lg:text-left">Gestion Client Améliorée</h3>
                            <ul className="space-y-6">
                               <AdvancedFeatureItem icon={<MessageSquareIcon className="w-5 h-5"/>} title="Portail Client Professionnel" desc="Offrez à vos clients un espace pour voir leur historique, télécharger leurs factures et vous contacter." />
                               <AdvancedFeatureItem icon={<GlobeIcon className="w-5 h-5"/>} title="Facturation Multi-devises" desc="Facturez en EUR ou USD avec synchronisation automatique du taux de change officiel de Bank Al-Maghrib." />
                               <AdvancedFeatureItem icon={<FileTextIcon className="w-5 h-5"/>} title="Conformité Auto-Entrepreneur" desc="Un mode spécial qui retire la TVA et ajoute les mentions légales obligatoires pour une conformité totale." />
                            </ul>
                       </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t('pricingTitle')}</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('pricingSubtitle')}</p>
                    <div className="mt-10 flex justify-center">
                        <Card className="max-w-sm w-full shadow-lg border-2 border-[var(--color-primary-500)]">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('pricingCardTitle')}</h3>
                            <div className="my-4">
                                <span className="text-4xl font-extrabold text-[var(--color-primary-500)]">{t('pricingCardPrice')}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-1">{t('pricingCardPriceDetail')}</span>
                            </div>
                            <ul className={`space-y-3 text-slate-600 dark:text-slate-300 mt-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                                <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" /> {t('pricingFeature1')}</li>
                                <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" /> {t('pricingFeature2')}</li>
                                <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" /> {t('pricingFeature3')}</li>
                                <li className="flex items-center gap-3"><CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" /> {t('pricingFeature4')}</li>
                            </ul>
                            <Link to="/register" className="mt-8 block">
                                <Button size="lg" className="w-full">{t('getStarted')}</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Final CTA */}
            <section className="py-20 bg-slate-50 dark:bg-slate-900">
                 <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">{t('ctaTitle')}</h2>
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('ctaSubtitle')}</p>
                    <div className="mt-8">
                        <Link to="/register">
                            <Button size="lg">{t('getStarted')}</Button>
                        </Link>
                    </div>
                 </div>
            </section>
        </div>
    );
};

export default Home;

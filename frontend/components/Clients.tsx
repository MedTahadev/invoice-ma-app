
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Card, Button, Modal } from './ui';
import { EditIcon, TrashIcon, PlusIcon, UserIcon, LinkIcon } from './icons';
import { Client } from '../types';

const Clients: React.FC = () => {
    const context = useContext(AppContext);
    const navigate = useNavigate();
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    if (!context) return null;
    const { clients, deleteClient, t, language, currentUser } = context;

    const isRtl = language === 'ar';

    const handleDeleteClick = (id: string) => {
        setClientToDelete(id);
    };

    const confirmDelete = () => {
        if (clientToDelete) {
            deleteClient(clientToDelete);
            setClientToDelete(null);
        }
    };
    
    const handleViewPortal = (client: Client) => {
        if (!currentUser) return;
        const portalData = {
            userId: currentUser.id,
            clientId: client.id
        };
        const encodedData = btoa(JSON.stringify(portalData));
        window.open(`${window.location.origin}${window.location.pathname}#/portal/${encodedData}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-slate-800">{t('clients')}</h1>
                 <Button onClick={() => navigate('/app/client/new')}>
                    <PlusIcon className="h-4 w-4" />
                    {t('newClient')}
                </Button>
            </div>
            
            <Card>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t('clientList')}</h2>
                <div className="overflow-x-auto">
                    <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`}>
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600">{t('clientName')}</th>
                                <th className="p-3 font-semibold text-slate-600">{t('clientEmail')}</th>
                                <th className="p-3 font-semibold text-slate-600">{t('clientPhone')}</th>
                                <th className="p-3 font-semibold text-slate-600">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length > 0 ? clients.map((client: Client) => (
                                <tr key={client.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{client.name}</td>
                                    <td className="p-3 text-slate-500">{client.email}</td>
                                    <td className="p-3 text-slate-500">{client.phone}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewPortal(client)} aria-label={t('viewPortal')} title={t('viewPortal')}><LinkIcon className="h-4 w-4 text-blue-500" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/client/edit/${client.id}`)} aria-label={t('edit')} title={t('edit')}><EditIcon className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(client.id)} className="text-red-500 hover:text-red-700" aria-label={t('delete')} title={t('delete')}><TrashIcon className="h-4 w-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-6 text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <UserIcon className="w-12 h-12 text-slate-300" />
                                            <span>{t('noClientsMessage')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={!!clientToDelete} onClose={() => setClientToDelete(null)} title={t('confirmDeleteClient')}>
                <p className="text-slate-600 mb-6">{t('confirmDeleteClient')}</p>
                <div className="flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setClientToDelete(null)}>{t('cancel')}</Button>
                    <Button variant="danger" onClick={confirmDelete}>{t('confirm')}</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Clients;

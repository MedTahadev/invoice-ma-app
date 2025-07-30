
import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Client } from '../types';
import { Card, Input, Button } from './ui';

const ClientForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const context = useContext(AppContext);

    if (!context) return null;
    const { getClientById, addClient, updateClient, t, language } = context;

    const isEditing = Boolean(id);
    const isRtl = language === 'ar';

    const getInitialState = (): Client => {
        if (isEditing && id) {
            const existingClient = getClientById(id);
            if (existingClient) return existingClient;
        }
        return {
            id: Date.now().toString(),
            name: '',
            email: '',
            phone: '',
            address: '',
            cin: '',
            ice: ''
        };
    };

    const [client, setClient] = useState<Client>(getInitialState);

    useEffect(() => {
        if (isEditing && id) {
            const existingClient = getClientById(id);
            if (existingClient) {
                setClient(existingClient);
            } else {
                // Handle case where client is not found
                navigate('/app/clients');
            }
        }
    }, [id, isEditing, getClientById, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClient(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            updateClient(client);
        } else {
            addClient(client);
        }
        navigate('/app/clients');
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800">{isEditing ? t('editClient') : t('newClient')}</h1>
            <form onSubmit={handleSubmit}>
                <Card>
                    <div className="space-y-4">
                        <Input id="name" name="name" label={t('clientName')} value={client.name} onChange={handleChange} required isRtl={isRtl} />
                        <Input id="email" name="email" type="email" label={t('clientEmail')} value={client.email} onChange={handleChange} isRtl={isRtl} />
                        <Input id="phone" name="phone" label={t('clientPhone')} value={client.phone} onChange={handleChange} isRtl={isRtl} />
                        <Input id="address" name="address" label={t('clientAddress')} value={client.address} onChange={handleChange} isRtl={isRtl} />
                        <Input id="cin" name="cin" label={t('clientCin')} value={client.cin} onChange={handleChange} isRtl={isRtl} />
                        <Input id="ice" name="ice" label={t('clientIce')} value={client.ice} onChange={handleChange} isRtl={isRtl} />
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button type="submit">{t('saveClient')}</Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default ClientForm;

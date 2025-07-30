
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Card, Input, Button } from './ui';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const context = useContext(AppContext);

    if (!context) return null;
    const { register, t, language } = context;
    const isRtl = language === 'ar';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        const result = await register(name, companyName, phone, email, password);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="w-full max-w-md">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={`text-center ${isRtl ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-xl font-bold text-slate-800">{t('register')}</h2>
                        <p className="text-sm text-slate-500">{t('createAccount')}</p>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        label={t('fullName')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        isRtl={isRtl}
                        autoComplete="name"
                    />
                     <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        label={t('companyName')}
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        isRtl={isRtl}
                        autoComplete="organization"
                    />
                     <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        label={t('phoneNumber')}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        isRtl={isRtl}
                        autoComplete="tel"
                    />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        label={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        isRtl={isRtl}
                        autoComplete="email"
                    />
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        label={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        isRtl={isRtl}
                        autoComplete="new-password"
                    />
                    <Button type="submit" className="w-full !mt-6">
                        {t('register')}
                    </Button>
                    <p className="text-sm text-center text-slate-600 pt-2">
                        {t('alreadyHaveAccount')}{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('login')}
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default Register;

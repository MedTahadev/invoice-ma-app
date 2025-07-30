
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Card, Input, Button } from './ui';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const context = useContext(AppContext);
    
    if (!context) return null;
    const { login, t, language } = context;
    const isRtl = language === 'ar';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(email, password);
        if (!success) {
            setError(t('invalidCredentials'));
        }
    };

    return (
        <div className="w-full max-w-sm">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={`text-center ${isRtl ? 'text-right' : 'text-left'}`}>
                        <h2 className="text-xl font-bold text-slate-800">{t('login')}</h2>
                        <p className="text-sm text-slate-500">{t('loginToYourAccount')}</p>
                    </div>
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
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
                        autoComplete="current-password"
                    />
                    <Button type="submit" className="w-full">
                        {t('login')}
                    </Button>
                    <p className="text-sm text-center text-slate-600">
                        {t('dontHaveAccount')}{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('register')}
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      login(data.token, data.user);
      navigate(from || '/listings');
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        navigate('/verify-email', { state: { email: err.response.data.email } });
        return;
      }
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('login_title')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('login_sub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('field_email')}</label>
              <input className="input" type="email" placeholder={t('field_email_ph')} value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">{t('field_password')}</label>
              <input className="input" type="password" placeholder={t('field_password_login_ph')} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('btn_logging') : t('btn_login')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('no_account')}{' '}
            <Link to="/signup" className="text-primary-600 font-semibold hover:underline">{t('signup_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

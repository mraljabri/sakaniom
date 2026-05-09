import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function SignupPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/signup', form);
      login(data.token, data.user);
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('signup_title')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('signup_sub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t('field_name')} *</label>
              <input className="input" type="text" placeholder={t('field_name_ph')} value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">{t('field_email')} *</label>
              <input className="input" type="email" placeholder={t('field_email_ph')} value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">{t('field_password')} *</label>
              <input className="input" type="password" placeholder={t('field_password_ph')} value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div>
              <label className="label">{t('field_phone')} <span className="text-gray-400">{t('field_optional')}</span></label>
              <input className="input" type="tel" placeholder={t('field_phone_ph')} value={form.phone} onChange={set('phone')} />
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? t('btn_creating') : t('btn_create')}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">Terms & Conditions</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-3">
            {t('have_account')}{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

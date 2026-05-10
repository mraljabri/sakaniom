import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

export default function SignupPage() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAr = lang === 'ar';

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError(isAr ? 'يجب الموافقة على الشروط والأحكام للمتابعة.' : 'You must agree to the Terms & Conditions to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/signup', form);
      navigate('/verify-email', { state: { email: form.email } });
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

            {/* Terms checkbox */}
            <div className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${agreedToTerms ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setAgreedToTerms(v => !v)}>
              <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-colors ${agreedToTerms ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                {agreedToTerms && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed select-none">
                {isAr ? (
                  <>أوافق على <Link to="/terms" onClick={e => e.stopPropagation()} className="text-primary-600 font-semibold hover:underline">الشروط والأحكام</Link> وأفهم أن سكني عُمان منصة وساطة فقط وغير مسؤولة عن أي اتفاقيات تتم خارجها.</>
                ) : (
                  <>I agree to the <Link to="/terms" onClick={e => e.stopPropagation()} className="text-primary-600 font-semibold hover:underline">Terms & Conditions</Link> and understand that SakaniOM is an intermediary platform not responsible for agreements made outside of it.</>
                )}
              </p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? t('btn_creating') : t('btn_create')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('have_account')}{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('login_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

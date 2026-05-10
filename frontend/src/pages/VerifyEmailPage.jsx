import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

export default function VerifyEmailPage() {
  const { lang } = useLanguage();
  const location = useLocation();
  const email = location.state?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const isAr = lang === 'ar';

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-verification', { email });
      setResent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
          </h1>
          <p className="text-gray-500 mb-1">
            {isAr ? 'أرسلنا رابط تأكيد إلى' : 'We sent a confirmation link to'}
          </p>
          <p className="text-primary-600 font-semibold mb-6">{email}</p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700 text-start">
            {isAr ? (
              <p>📧 افتح بريدك الإلكتروني وانقر على زر <strong>"Confirm My Account"</strong> لتفعيل حسابك.</p>
            ) : (
              <p>📧 Open your email and click the <strong>"Confirm My Account"</strong> button to activate your account.</p>
            )}
          </div>

          {resent && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
              {isAr ? '✅ تم إرسال رابط جديد!' : '✅ New confirmation email sent!'}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-3">
            {isAr ? 'لم تستلم البريد؟' : "Didn't receive the email?"}
          </p>
          <button onClick={handleResend} disabled={resending || resent}
            className="btn-secondary w-full mb-4 disabled:opacity-50">
            {resending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إعادة إرسال رابط التأكيد' : 'Resend confirmation email')}
          </button>

          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
            {isAr ? '← العودة لتسجيل الدخول' : '← Back to login'}
          </Link>
        </div>
      </div>
    </div>
  );
}

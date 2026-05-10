import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function VerifyEmailPage() {
  const { login } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleDigit = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
    if (next.every(d => d !== '') && next.join('').length === 6) {
      submitCode(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      submitCode(pasted);
    }
  };

  const submitCode = async (code) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/verify-email', { email, code });
      login(data.token, data.user);
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-code', { email });
      setResent(true);
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  const isAr = lang === 'ar';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAr ? 'تحقق من بريدك الإلكتروني' : 'Verify your email'}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {isAr
                ? `أرسلنا رمز مكوّن من 6 أرقام إلى`
                : `We sent a 6-digit code to`}
            </p>
            <p className="text-primary-600 font-semibold text-sm">{email}</p>
          </div>

          {/* Code input boxes */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste} dir="ltr">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-colors outline-none
                  ${d ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {/* Resent confirmation */}
          {resent && !error && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4 text-center">
              {isAr ? 'تم إرسال رمز جديد!' : 'New code sent!'}
            </div>
          )}

          {/* Resend */}
          <div className="text-center text-sm text-gray-500">
            {isAr ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
            {countdown > 0 ? (
              <span className="text-gray-400 ms-1">
                {isAr ? `أعد الإرسال بعد ${countdown}ث` : `Resend in ${countdown}s`}
              </span>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-primary-600 font-semibold hover:underline ms-1 disabled:opacity-50">
                {resending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إعادة الإرسال' : 'Resend')}
              </button>
            )}
          </div>

          <div className="text-center mt-4">
            <Link to="/signup" className="text-xs text-gray-400 hover:text-gray-600">
              {isAr ? '← العودة للتسجيل' : '← Back to sign up'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

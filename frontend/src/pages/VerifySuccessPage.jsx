import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { jwtDecode } from 'jwt-decode';

export default function VerifySuccessPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const isAr = lang === 'ar';

  useEffect(() => {
    const token = searchParams.get('token');
    const name = searchParams.get('name');

    if (!token) {
      setStatus('error');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const user = {
        id: decoded.id,
        name: decoded.name || decodeURIComponent(name || ''),
        email: decoded.email,
        role: decoded.role,
        isAdmin: decoded.isAdmin || false,
      };
      login(token, user);
      setStatus('success');
      setTimeout(() => navigate('/listings'), 2500);
    } catch {
      setStatus('error');
    }
  }, []);

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  if (status === 'error') return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {isAr ? 'رابط غير صالح' : 'Invalid or expired link'}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          {isAr ? 'هذا الرابط غير صالح أو انتهت صلاحيته.' : 'This confirmation link is invalid or has expired.'}
        </p>
        <a href="/signup" className="btn-primary inline-block">
          {isAr ? 'العودة للتسجيل' : 'Back to Sign Up'}
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isAr ? 'تم تأكيد حسابك! 🎉' : 'Account confirmed! 🎉'}
        </h1>
        <p className="text-gray-500 mb-2">
          {isAr ? 'مرحباً بك في سكني عُمان.' : 'Welcome to SakaniOM.'}
        </p>
        <p className="text-sm text-gray-400">
          {isAr ? 'جارٍ التحويل...' : 'Redirecting you now...'}
        </p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

// Wraps the posting pages: renders them only for identity-verified users
// (or admins), otherwise explains what is needed and links to verification.
export default function VerificationGate({ children }) {
  const { t } = useLanguage();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios.get('/api/verification/me').then(r => setInfo(r.data)).catch(() => setInfo({ identityStatus: 'none' }));
  }, []);

  if (!info) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (info.isAdmin || info.identityStatus === 'approved') return children;

  const pending = info.identityStatus === 'pending';
  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="card p-8 text-center">
        <div className="text-5xl mb-3">{pending ? '⏳' : '🪪'}</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{pending ? t('vi_pending_title') : t('gate_title')}</h1>
        <p className="text-gray-500 mb-6">{pending ? t('gate_pending') : t('gate_desc')}</p>
        {!pending && <Link to="/verify-identity" className="btn-primary">{t('gate_btn')}</Link>}
      </div>
    </div>
  );
}

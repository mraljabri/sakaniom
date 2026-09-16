import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LiveCamera from '../components/LiveCamera';
import { useLanguage } from '../contexts/LanguageContext';

function DocInput({ label, hint, file, onChange }) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div>
      <label className="label">{label} *</label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>
      {preview ? (
        <div className="space-y-2">
          <img src={preview} alt="" className="w-full aspect-[16/10] object-cover rounded-2xl border border-gray-200" />
          <label className="btn-secondary w-full cursor-pointer">{t('vi_change')}
            <input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
      ) : (
        <label className="press flex flex-col items-center justify-center gap-2 w-full aspect-[16/10] rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 cursor-pointer text-gray-500">
          <span className="text-3xl">🪪</span>
          <span className="text-sm font-medium">{t('vi_choose')}</span>
          <input type="file" accept="image/*" onChange={e => onChange(e.target.files?.[0] || null)} className="hidden" />
        </label>
      )}
    </div>
  );
}

export default function VerifyIdentityPage() {
  const { t } = useLanguage();
  const [info, setInfo] = useState(null);
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => axios.get('/api/verification/me').then(r => setInfo(r.data)).catch(() => setInfo({ identityStatus: 'none' }));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!front || !back || !selfie) return;
    setError(''); setLoading(true);
    try {
      const data = new FormData();
      data.append('idFront', front); data.append('idBack', back);
      data.append('selfie', selfie, 'selfie.jpg');
      await axios.post('/api/verification', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      await load();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally { setLoading(false); }
  };

  if (!info) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const status = info.identityStatus;
  const StatusCard = ({ icon, title, desc, children }) => (
    <div className="card p-8 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
      <p className="text-gray-500">{desc}</p>
      {children}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('vi_title')}</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">{t('vi_sub')}</p>

      {status === 'approved' && (
        <StatusCard icon="✅" title={t('vi_approved_title')} desc={t('vi_approved_desc')}>
          <Link to="/create-listing" className="btn-primary mt-6">{t('vi_start_posting')}</Link>
        </StatusCard>
      )}

      {status === 'pending' && (
        <StatusCard icon="⏳" title={t('vi_pending_title')}
          desc={t('vi_pending_desc', { date: new Date(info.latest?.createdAt || Date.now()).toLocaleDateString() })} />
      )}

      {(status === 'none' || status === 'rejected') && (
        <form onSubmit={submit} className="space-y-6">
          {status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="font-semibold text-red-800">{t('vi_rejected_title')}</p>
              <p className="text-sm text-red-700 mt-1">{t('vi_rejected_desc')}</p>
              {info.latest?.reviewNote && <p className="text-sm text-red-900 mt-2 bg-white/60 rounded-lg px-3 py-2">“{info.latest.reviewNote}”</p>}
            </div>
          )}
          <p className="text-sm text-gray-600 bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">🔒 {t('vi_why')}</p>

          <div className="card p-5 space-y-5">
            <DocInput label={t('vi_step_front')} hint={t('vi_doc_hint')} file={front} onChange={setFront} />
            <DocInput label={t('vi_step_back')}  hint={t('vi_doc_hint')} file={back}  onChange={setBack} />
          </div>

          <div className="card p-5">
            <label className="label">{t('vi_step_selfie')} *</label>
            <p className="text-xs text-gray-500 mb-3">{t('vi_selfie_hint')}</p>
            <LiveCamera onCapture={setSelfie} />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <button type="submit" disabled={loading || !front || !back || !selfie} className="btn-primary w-full">
            {loading ? t('vi_submitting') : t('vi_submit')}
          </button>
        </form>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

// Complaint / feedback form. Route is protected, so the user is signed in.
export default function FeedbackPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ type: 'complaint', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [mine, setMine] = useState([]);

  const loadMine = () => axios.get('/api/feedback/mine').then(r => setMine(r.data)).catch(() => {});
  useEffect(() => { loadMine(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await axios.post('/api/feedback', form);
      setDone(true);
      setForm({ type: 'complaint', subject: '', message: '' });
      loadMine();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900">{t('fb_title')}</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">{t('fb_sub')}</p>

      {done ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{t('fb_thanks_title')}</h2>
          <p className="text-gray-500 mb-6">{t('fb_thanks_desc')}</p>
          <button onClick={() => setDone(false)} className="btn-secondary">{t('fb_another')}</button>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 space-y-5">
          <div>
            <label className="label">{t('fb_type')}</label>
            <div className="segmented w-full" role="tablist">
              {['complaint', 'feedback'].map(v => (
                <button key={v} type="button" role="tab" aria-selected={form.type === v}
                  onClick={() => setForm(f => ({ ...f, type: v }))}>
                  {v === 'complaint' ? '⚠️ ' : '💡 '}{t(`fb_type_${v}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">{t('fb_subject')} *</label>
            <input className="input" value={form.subject} onChange={set('subject')} placeholder={t('fb_subject_ph')} required maxLength={150} />
          </div>
          <div>
            <label className="label">{t('fb_message')} *</label>
            <textarea className="input min-h-[160px] resize-y" value={form.message} onChange={set('message')} placeholder={t('fb_message_ph')} required maxLength={3000} rows={6} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('fb_submitting') : t('fb_submit')}
          </button>
        </form>
      )}

      {mine.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900 mb-3">{t('fb_mine_title')}</h2>
          <ul className="space-y-2">
            {mine.map(m => (
              <li key={m._id} className="card p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{m.type === 'complaint' ? '⚠️' : '💡'} {m.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(m.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge flex-shrink-0 ${m.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t(`fb_status_${m.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

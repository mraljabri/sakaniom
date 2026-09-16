import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/listings'),
      axios.get('/api/admin/users'),
      axios.get('/api/feedback'),
      axios.get('/api/verification'),
    ]).then(([l, u, f, v]) => {
      setListings(l.data);
      setUsers(u.data);
      setFeedback(f.data);
      setVerifications(v.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const setFeedbackStatus = async (id, status) => {
    try {
      await axios.patch(`/api/feedback/${id}`, { status });
      setFeedback(fs => fs.map(f => f._id === id ? { ...f, status } : f));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update.'); }
  };

  const reviewVerification = async (id, status) => {
    if (status === 'rejected' && !window.confirm('Reject this verification?')) return;
    try {
      await axios.patch(`/api/verification/${id}`, { status, note: notes[id] || '' });
      setVerifications(vs => vs.map(v => v._id === id ? { ...v, status, reviewNote: notes[id] || '' } : v));
      setUsers(us => us.map(u => u._id === verifications.find(v => v._id === id)?.userId ? { ...u, identityStatus: status } : u));
    } catch (err) { alert(err.response?.data?.error || 'Failed to update.'); }
  };

  const deleteListing = async (id, title) => {
    if (!window.confirm(t('admin_confirm_delete_listing'))) return;
    try {
      await axios.delete(`/api/admin/listings/${id}`);
      setListings(ls => ls.filter(l => l._id !== id && l.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'inactive' : 'active';
    try {
      await axios.patch(`/api/admin/listings/${id}/status`, { status: newStatus });
      setListings(ls => ls.map(l => (l._id === id || l.id === id) ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm(t('admin_confirm_delete_user'))) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(us => us.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const periodLabel = (p) => p === 'week' ? t('detail_per_week') : p === 'day' ? t('detail_per_day') : t('detail_per_month');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🛡️ {t('admin_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Full control over all listings and users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Listings', value: listings.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Active Listings', value: listings.filter(l => l.status === 'active').length, color: 'bg-green-50 text-green-700' },
          { label: 'Total Users', value: users.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Creators', value: users.filter(u => u.role === 'creator').length, color: 'bg-orange-50 text-orange-700' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} rounded-lg px-2 py-0.5 inline-block`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('listings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'listings' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          {t('admin_listings')} ({listings.length})
        </button>
        <button onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'users' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          {t('admin_users')} ({users.length})
        </button>
        <button onClick={() => setTab('feedback')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'feedback' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          {t('admin_feedback')} ({feedback.filter(f => f.status === 'open').length})
        </button>
        <button onClick={() => setTab('verifications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'verifications' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          {t('admin_verifications')} ({verifications.filter(v => v.status === 'pending').length})
        </button>
      </div>

      {/* Feedback */}
      {tab === 'feedback' && (
        <div className="space-y-3">
          {feedback.length === 0 && <p className="card text-center text-gray-400 py-8">{t('admin_no_feedback')}</p>}
          {feedback.map(f => (
            <div key={f._id} className={`card p-5 ${f.status === 'resolved' ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${f.type === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{f.type}</span>
                    <span className={`badge ${f.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{f.status}</span>
                    <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-2">{f.subject}</h3>
                  <p className="text-sm text-gray-500">{f.userName} · <a href={`mailto:${f.userEmail}`} className="hover:underline">{f.userEmail}</a></p>
                </div>
                <button onClick={() => setFeedbackStatus(f._id, f.status === 'open' ? 'resolved' : 'open')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${f.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f.status === 'open' ? t('admin_resolve') : t('admin_reopen')}
                </button>
              </div>
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Verifications */}
      {tab === 'verifications' && (
        <div className="space-y-3">
          {verifications.length === 0 && <p className="card text-center text-gray-400 py-8">{t('admin_no_verifications')}</p>}
          {verifications.map(v => (
            <div key={v._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{v.userName}</h3>
                  <p className="text-sm text-gray-500">{v.userEmail} · {new Date(v.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{v.status}</span>
              </div>
              {v.status === 'pending' ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[['ID front', v.idFrontUrl], ['ID back', v.idBackUrl], ['Selfie', v.selfieUrl]].map(([label, url]) => (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={url} alt={label} className="w-full aspect-[4/3] object-cover rounded-xl border border-gray-200" />
                        <p className="text-xs text-gray-500 text-center mt-1">{label}</p>
                      </a>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input className="input text-sm flex-1" placeholder={t('admin_note_ph')} value={notes[v._id] || ''} onChange={e => setNotes(n => ({ ...n, [v._id]: e.target.value }))} />
                    <button onClick={() => reviewVerification(v._id, 'approved')} className="btn-primary text-sm !bg-green-600 hover:!bg-green-700">{t('admin_approve')}</button>
                    <button onClick={() => reviewVerification(v._id, 'rejected')} className="btn-danger text-sm">{t('admin_reject')}</button>
                  </div>
                </>
              ) : (
                v.reviewNote && <p className="text-sm text-gray-600">Note: {v.reviewNote}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Listings Table */}
      {tab === 'listings' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Title</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Creator</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Price</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">City</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-end px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/listings/${l._id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
                        {l.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.creatorName}</td>
                    <td className="px-4 py-3 font-medium text-primary-600">
                      OMR {l.price?.toLocaleString()}{periodLabel(l.price_period)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.city}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(l.createdAt || l.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatus(l._id, l.status)}
                          className={`text-xs px-2 py-1 rounded font-medium ${l.status === 'active' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {l.status === 'active' ? t('admin_deactivate') : t('admin_activate')}
                        </button>
                        <button onClick={() => deleteListing(l._id, l.title)}
                          className="text-xs px-2 py-1 rounded font-medium bg-red-100 text-red-700 hover:bg-red-200">
                          {t('admin_delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {listings.length === 0 && (
              <p className="text-center text-gray-400 py-8">No listings yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Phone</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-500">Joined</th>
                  <th className="text-end px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                      {u.name}
                      {u.isAdmin && <span className="badge bg-red-100 text-red-700">Admin</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.role === 'creator' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                      {u.identityStatus === 'approved' && <span className="badge bg-green-100 text-green-700 ms-1">✓ ID</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                      {!u.isAdmin && (
                        <button onClick={() => deleteUser(u._id)}
                          className="text-xs px-2 py-1 rounded font-medium bg-red-100 text-red-700 hover:bg-red-200">
                          {t('admin_delete')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center text-gray-400 py-8">No users yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

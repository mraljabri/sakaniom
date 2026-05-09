import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/listings'),
      axios.get('/api/admin/users'),
    ]).then(([l, u]) => {
      setListings(l.data);
      setUsers(u.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      </div>

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

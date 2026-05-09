import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gUGhvdG88L3RleHQ+PC9zdmc+';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/listings/my')
      .then(r => setListings(r.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(t('dash_confirm', { title }))) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/listings/${id}`);
      setListings(ls => ls.filter(l => l.id !== id && l._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = [
    { label: t('stat_total'),         value: listings.length,                                                               icon: '🏠', color: 'bg-blue-50 text-blue-700' },
    { label: t('stat_active'),        value: listings.filter(l => l.status === 'active').length,                            icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: t('stat_revenue'),       value: `OMR ${listings.reduce((s, l) => s + (l.price || 0), 0).toLocaleString()}`,   icon: '💰', color: 'bg-amber-50 text-amber-700' },
    { label: t('stat_cities_listed'), value: [...new Set(listings.map(l => l.city))].length,                                icon: '📍', color: 'bg-purple-50 text-purple-700' },
  ];

  const listingCount = listings.length === 1 ? `1 ${t('dash_listing')}` : `${listings.length} ${t('dash_listings_pl')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dash_title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('dash_welcome')} <span className="font-medium text-gray-700">{user?.name}</span>
          </p>
        </div>
        <Link to="/create-listing" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('dash_new')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-current border-opacity-10`}>
            <span className="text-2xl block mb-1">{s.icon}</span>
            <span className="text-2xl font-bold block">{s.value}</span>
            <span className="text-xs font-medium opacity-80">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Listings */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('dash_my_listings')}</h2>
          {listings.length > 0 && <span className="text-sm text-gray-500">{listingCount}</span>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('dash_no_listings')}</h3>
            <p className="text-gray-500 text-sm mb-6">{t('dash_no_listings_sub')}</p>
            <Link to="/create-listing" className="btn-primary">{t('dash_first')}</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {listings.map(l => {
              const listingId = l.id || l._id;
              const photoCount = l.photos?.length || 0;
              const photoLabel = photoCount === 1 ? t('dash_photos', { n: 1 }) : t('dash_photos_pl', { n: photoCount });

              return (
                <div key={listingId} className="p-4 flex gap-4 items-start hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={l.photos?.[0] ? `/uploads/${l.photos[0]}` : PLACEHOLDER} alt={l.title}
                      className="w-full h-full object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{l.title}</h3>
                      <span className={`badge text-xs ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>📍 {l.neighborhood ? `${l.neighborhood}, ` : ''}{l.city}</span>
                      <span>🛏 {l.bedrooms === 0 ? t('hero_studio') : `${l.bedrooms}BR`}</span>
                      <span>🚿 {l.bathrooms}BA</span>
                      {photoCount > 0 && <span>📷 {photoLabel}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('dash_listed')} {new Date(l.created_at || l.createdAt).toLocaleDateString('en-OM', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-end flex-shrink-0">
                    <p className="font-bold text-primary-600">OMR {l.price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{t('dash_per_month')}</p>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link to={`/listings/${listingId}`}
                      className="text-xs border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg transition-colors text-center">
                      {t('dash_view')}
                    </Link>
                    <button onClick={() => handleDelete(listingId, l.title)} disabled={deletingId === listingId}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      {deletingId === listingId ? '…' : t('dash_delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { mediaUrl, PLACEHOLDER } from '../utils/media';

function Stars({ value }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className={`w-4 h-4 ${n <= Math.round(value) ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function LandlordPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/listings/by-creator/${id}`),
      axios.get(`/api/ratings/${id}`),
    ]).then(([listRes, ratingRes]) => {
      setListings(listRes.data);
      setStats(ratingRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const creatorName = stats?.creatorName || listings[0]?.creator_name || listings[0]?.creatorName || '…';
  const listingCount = listings.length;
  const countText = listingCount === 1
    ? t('landlord_listing_count').replace('{n}', listingCount)
    : t('landlord_listing_count_pl').replace('{n}', listingCount);
  const ratingCountText = stats?.count === 1
    ? t('rating_count').replace('{n}', stats.count)
    : t('rating_count_pl').replace('{n}', stats?.count || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/listings" className="hover:text-primary-600 transition-colors">{t('detail_back')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{creatorName}</span>
      </div>

      {/* Landlord header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-3xl">{creatorName[0]?.toUpperCase()}</span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{creatorName}</h1>
            <div className="flex flex-wrap items-center gap-4">
              {/* Listing count */}
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {countText}
              </span>

              {/* Rating */}
              {stats?.count > 0 ? (
                <span className="inline-flex items-center gap-2">
                  <Stars value={stats.avg} />
                  <span className="font-semibold text-gray-800">{stats.avg}</span>
                  <span className="text-sm text-gray-500">({ratingCountText})</span>
                </span>
              ) : (
                <span className="text-sm text-gray-400">{t('rating_no_reviews')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent comments */}
        {stats?.recent?.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('rating_reviews')}</h3>
            <div className="space-y-3">
              {stats.recent.map((r, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex gap-0.5 flex-shrink-0 mt-0.5">
                    <Stars value={r.rating} />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Listings grid */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">{t('landlord_all_by')} {creatorName}</h2>
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">{t('landlord_no_listings')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(l => {
            const periodKey = l.price_period === 'week' ? 'detail_per_week' : l.price_period === 'day' ? 'detail_per_day' : 'detail_per_month';
            const bedsLabel = l.bedrooms === 0 ? t('detail_studio') : `${l.bedrooms} ${t('detail_bed')}`;
            return (
              <Link key={l.id || l._id} to={`/listings/${l.id || l._id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative h-48 bg-gray-100">
                  <img src={mediaUrl(l.photos?.[0])} alt={l.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = PLACEHOLDER; }} />
                  <div className="absolute top-2 end-2 bg-white/90 backdrop-blur-sm text-xs font-semibold text-primary-700 px-2 py-1 rounded-lg">
                    OMR {l.price?.toLocaleString()} {t(periodKey)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{l.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {l.neighborhood ? `${l.neighborhood}, ` : ''}{l.city}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>🛏 {bedsLabel}</span>
                    <span>🚿 {l.bathrooms} {t('detail_bath')}</span>
                    <span>{t(l.property_type) || l.property_type}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

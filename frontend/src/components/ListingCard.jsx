import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { mediaUrl, PLACEHOLDER } from '../utils/media';

const furnishedColors = {
  furnished:       'bg-green-100 text-green-700',
  'semi-furnished':'bg-yellow-100 text-yellow-700',
  unfurnished:     'bg-gray-100 text-gray-600',
};

const typeColors = {
  Apartment: 'bg-blue-100 text-blue-700',
  Villa:     'bg-purple-100 text-purple-700',
  Studio:    'bg-orange-100 text-orange-700',
  Townhouse: 'bg-teal-100 text-teal-700',
  Penthouse: 'bg-rose-100 text-rose-700',
};

export default function ListingCard({ listing }) {
  const { t } = useLanguage();
  const imgSrc = mediaUrl(listing.photos?.[0]);
  const furnishedKey = listing.furnished === 'furnished' ? 'furnished' : listing.furnished === 'semi-furnished' ? 'semi_furnished' : 'unfurnished';
  const bedsLabel = listing.bedrooms === 0 ? t('detail_studio') : `${listing.bedrooms} ${t('detail_bed')}`;

  return (
    <Link to={`/listings/${listing.id || listing._id}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      <div className="relative overflow-hidden h-48 bg-gray-100">
        <img src={imgSrc} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = PLACEHOLDER; }} />
        <div className="absolute top-3 start-3 flex gap-1.5 flex-wrap">
          <span className={`badge ${typeColors[listing.property_type] || 'bg-gray-100 text-gray-600'}`}>
            {t(listing.property_type) || listing.property_type}
          </span>
          {listing.photos?.length > 1 && (
            <span className="badge bg-black/50 text-white">
              <svg className="w-3 h-3 me-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/></svg>
              {listing.photos.length}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 end-3">
          <span className="bg-primary-600 text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow">
            OMR {listing.price?.toLocaleString()}<span className="font-normal text-xs opacity-90"> {t('detail_per_month')}</span>
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>🛏 {bedsLabel}</span>
          <span>🚿 {listing.bathrooms} {t('detail_bath')}</span>
          {listing.area_sqm && <span>📐 {listing.area_sqm}m²</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className={`badge ${furnishedColors[listing.furnished] || 'bg-gray-100 text-gray-600'}`}>
            {t(furnishedKey)}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(listing.created_at || listing.createdAt).toLocaleDateString('en-OM', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </Link>
  );
}

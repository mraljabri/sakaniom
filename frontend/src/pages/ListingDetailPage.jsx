import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mediaUrl, PLACEHOLDER } from '../utils/media';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(t('detail_confirm_delete'))) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/listings/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing.');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );
  if (!listing) return null;

  const photos = listing.photos?.length ? listing.photos : [];
  const isOwner = user && (user.id === listing.creator_id || user.id === String(listing.creatorId));
  const canManage = isOwner || user?.isAdmin;
  const periodKey = listing.price_period === 'week' ? 'detail_per_week' : listing.price_period === 'day' ? 'detail_per_day' : 'detail_per_month';
  const furnishedKey = listing.furnished === 'furnished' ? 'furnished' : listing.furnished === 'semi-furnished' ? 'semi_furnished' : 'unfurnished';
  const furnishedLabel = t(furnishedKey);
  const furnishedColor = listing.furnished === 'furnished' ? 'bg-green-100 text-green-700' : listing.furnished === 'semi-furnished' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600';
  const bedsLabel = listing.bedrooms === 0 ? t('detail_studio') : `${listing.bedrooms} ${t('detail_bed')}`;

  const maskPhone = (phone) => {
    if (!phone) return '•••• ••••';
    const s = phone.trim();
    if (s.startsWith('+968') || s.startsWith('00968')) return '+968 •••• ••••';
    if (s.length >= 8) return s.slice(0, 2) + '•• •••• ••';
    return '•••• ••••';
  };

  const detail = (icon, label, value) => value != null && value !== '' && (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm text-gray-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/listings" className="hover:text-primary-600 transition-colors">{t('detail_back')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="card overflow-hidden">
            <div className="relative bg-gray-100 h-80 md:h-96">
              <img src={mediaUrl(photos[activePhoto])} alt={listing.title}
                className="w-full h-full object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setActivePhoto(p => (p - 1 + photos.length) % photos.length)}
                    className="absolute start-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl">‹</button>
                  <button onClick={() => setActivePhoto(p => (p + 1) % photos.length)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors text-xl">›</button>
                  <div className="absolute bottom-3 end-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                    {activePhoto + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activePhoto === i ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={mediaUrl(p)} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Videos */}
          {listing.videos?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                {t('detail_videos')}
              </h3>
              <div className="space-y-3">
                {listing.videos.map((v, i) => (
                  <video key={i} controls className="w-full rounded-lg max-h-64 bg-black">
                    <source src={mediaUrl(v)} />
                  </video>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{t('detail_description')}</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description || t('detail_no_desc')}</p>
          </div>

          {/* Details */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{t('detail_details')}</h3>
            <div>
              {detail('🏠', t('detail_type'),       t(listing.property_type) || listing.property_type)}
              {detail('📍', t('detail_city'),       listing.city)}
              {listing.neighborhood && detail('📌', t('detail_neighborhood'), listing.neighborhood)}
              {detail('🛏', t('detail_beds'),       bedsLabel)}
              {detail('🚿', t('detail_baths'),      listing.bathrooms)}
              {listing.area_sqm && detail('📐', t('detail_area'), `${listing.area_sqm} m²`)}
              {detail('🛋', t('detail_furnished'),  furnishedLabel)}
              {listing.contract_period && detail('📋', t('detail_contract'), t(`contract_${listing.contract_period}`))}
              {listing.family_status   && detail('👨‍👩‍👧', t('detail_family'),   t(`family_${listing.family_status}`))}
              {listing.payment_method  && detail('💳', t('detail_payment'),  t(`payment_${listing.payment_method}`))}
              {detail('📅', t('detail_listed'),     new Date(listing.created_at || listing.createdAt).toLocaleDateString('en-OM', { year: 'numeric', month: 'long', day: 'numeric' }))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-3xl font-bold text-primary-600">OMR {listing.price?.toLocaleString()}</span>
                <span className="text-gray-500 text-sm"> {t(periodKey)}</span>
              </div>
              <span className={`badge ${furnishedColor}`}>{furnishedLabel}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h1>
            <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 py-3 border-y border-gray-100">
              <span>🛏 {bedsLabel}</span>
              <span>🚿 {listing.bathrooms} {t('detail_bath')}</span>
              {listing.area_sqm && <span>📐 {listing.area_sqm}m²</span>}
            </div>
          </div>

          {/* Contact */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('detail_contact')}
            </h3>
            <div className="space-y-3">
              {/* Owner name */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 font-bold">{listing.contact_name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{listing.contact_name}</p>
                  <p className="text-xs text-gray-500">{t('detail_agent')}</p>
                </div>
              </div>

              {/* Phone — masked until revealed */}
              {!phoneRevealed ? (
                <button
                  onClick={() => setPhoneRevealed(true)}
                  className="w-full flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 transition-colors"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="flex-1 text-start">
                    <span className="font-semibold block">{t('detail_reveal_phone')}</span>
                    <span className="text-primary-200 text-sm font-mono tracking-widest">{maskPhone(listing.contact_phone)}</span>
                  </div>
                </button>
              ) : (
                <>
                  <a href={`tel:${listing.contact_phone}`}
                    className="flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-4 py-3 transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-semibold">{listing.contact_phone}</span>
                  </a>
                  <a href={`https://wa.me/${listing.contact_phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.116 1.525 5.84L.057 24l6.348-1.465A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.664-.516-5.185-1.415l-.371-.22-3.846.888.934-3.753-.242-.387A9.958 9.958 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    <span className="font-semibold">{t('detail_whatsapp')}</span>
                  </a>
                </>
              )}

              {/* Email — only if lister opted in */}
              {listing.show_email && listing.contact_email && (
                <a href={`mailto:${listing.contact_email}`}
                  className="flex items-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-3 transition-colors">
                  <svg className="w-5 h-5 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-gray-400 block">{t('detail_email_btn')}</span>
                    <span className="font-medium text-sm truncate block">{listing.contact_email}</span>
                  </div>
                </a>
              )}
            </div>
          </div>

          {canManage && (
            <div className="card p-4 border-amber-200 bg-amber-50">
              <p className="text-sm font-medium text-amber-800 mb-3">{t('detail_own')}</p>
              <div className="flex gap-2 flex-wrap">
                <Link to="/dashboard" className="flex-1 btn-secondary text-sm text-center">{t('detail_dashboard')}</Link>
                <Link to={`/edit-listing/${id}`} className="flex-1 btn-secondary text-sm text-center">{t('detail_edit')}</Link>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 btn-danger text-sm">
                  {deleting ? t('detail_deleting') : t('detail_delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function SaleListingsPage() {
  const [searchParams] = useSearchParams();
  const { t, CITIES, TYPES, OWNERSHIP_TYPES, SELLER_TYPES, FURNISHED_OPTIONS } = useLanguage();
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    city:           searchParams.get('city') || '',
    property_type:  searchParams.get('property_type') || '',
    bedrooms:       searchParams.get('bedrooms') || '',
    bathrooms:      '',
    min_price:      '',
    max_price:      '',
    furnished:      '',
    ownership_type: '',
    seller_type:    '',
    search:         searchParams.get('search') || '',
    sort:           'newest',
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), listing_purpose: 'sale' };
      const { data } = await axios.get('/api/listings', { params });
      setListings(data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => setFilters({ city: '', property_type: '', bedrooms: '', bathrooms: '', min_price: '', max_price: '', furnished: '', ownership_type: '', seller_type: '', search: '', sort: 'newest' });
  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  const bedOptions = [
    { value: '0',  label: t('bed_studio') },
    { value: '1',  label: '1' },
    { value: '2',  label: '2' },
    { value: '3',  label: '3' },
    { value: '4+', label: t('bed_4plus') },
  ];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="label">{t('filter_keyword')}</label>
        <input className="input text-sm" type="text" placeholder={t('filter_keyword_ph')} value={filters.search} onChange={e => setFilter('search', e.target.value)} />
      </div>
      <div>
        <label className="label">{t('filter_city')}</label>
        <select className="input text-sm" value={filters.city} onChange={e => setFilter('city', e.target.value)}>
          <option value="">{t('hero_all_cities')}</option>
          {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{t('filter_type')}</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(tp => (
            <button key={tp.value} onClick={() => setFilter('property_type', filters.property_type === tp.value ? '' : tp.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.property_type === tp.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}>
              {tp.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">{t('sale_asking_price')}</label>
        <div className="flex gap-2">
          <input className="input text-sm" type="number" placeholder={t('filter_price_min')} value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} min="0" />
          <input className="input text-sm" type="number" placeholder={t('filter_price_max')} value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} min="0" />
        </div>
      </div>
      <div>
        <label className="label">{t('filter_beds')}</label>
        <div className="flex flex-wrap gap-2">
          {bedOptions.map(b => (
            <button key={b.value} onClick={() => setFilter('bedrooms', filters.bedrooms === b.value ? '' : b.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.bedrooms === b.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}>
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">{t('filter_baths')}</label>
        <div className="flex flex-wrap gap-2">
          {['1','2','3','4'].map(b => (
            <button key={b} onClick={() => setFilter('bathrooms', filters.bathrooms === b ? '' : b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.bathrooms === b ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}>
              {b}+
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">{t('filter_furnished')}</label>
        <div className="flex flex-col gap-2">
          {FURNISHED_OPTIONS.map(f => (
            <label key={f.value} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="furnished_sale" value={f.value} checked={filters.furnished === f.value} onChange={() => setFilter('furnished', filters.furnished === f.value ? '' : f.value)} className="text-emerald-600" />
              <span className="text-sm text-gray-700">{f.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label">{t('filter_ownership')}</label>
        <select className="input text-sm" value={filters.ownership_type} onChange={e => setFilter('ownership_type', e.target.value)}>
          <option value="">— {t('filter_ownership')} —</option>
          {OWNERSHIP_TYPES.filter(o => o.value).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{t('sale_seller_type')}</label>
        <div className="flex flex-wrap gap-2">
          {SELLER_TYPES.filter(s => s.value).map(s => (
            <button key={s.value} onClick={() => setFilter('seller_type', filters.seller_type === s.value ? '' : s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.seller_type === s.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <button onClick={clearFilters} className="w-full text-sm text-red-600 border border-red-200 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium">
          {t('filter_clear', { n: activeCount })}
        </button>
      )}
    </div>
  );

  const countLabel = loading
    ? t('loading')
    : listings.length === 1
      ? t('n_properties_found', { n: 1 })
      : t('n_properties_found_pl', { n: listings.length });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{t('sale_badge')}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('page_buy_title')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{countLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="newest">{t('sort_newest')}</option>
            <option value="price_asc">{t('sort_price_asc')}</option>
            <option value="price_desc">{t('sort_price_desc')}</option>
          </select>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden btn-secondary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            {t('filter_label')}
            {activeCount > 0 && <span className="bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{activeCount}</span>}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {t('filter_title')}
            </h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative ms-auto w-80 bg-white h-full overflow-y-auto p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{t('filter_title')}</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏡</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('no_listings')}</h3>
              <p className="text-gray-500 mb-6">{t('no_listings_sub')}</p>
              <button onClick={clearFilters} className="btn-primary">{t('clear_filters')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map(l => <ListingCard key={l.id || l._id} listing={l} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

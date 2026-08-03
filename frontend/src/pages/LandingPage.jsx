import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, lang, CITIES, TYPES } = useLanguage();
  const [rentListings, setRentListings]   = useState([]);
  const [saleListings, setSaleListings]   = useState([]);
  const [quickCity, setQuickCity]     = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [quickMode, setQuickMode]     = useState('rent');

  const runQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickCity)   params.set('city', quickCity);
    if (quickSearch) params.set('search', quickSearch.trim());
    navigate(`${quickMode === 'sale' ? '/buy' : '/listings'}?${params.toString()}`);
  };

  useEffect(() => {
    axios.get('/api/listings', { params: { listing_purpose: 'rent' } })
      .then(r => setRentListings(r.data.slice(0, 6))).catch(() => {});
    axios.get('/api/listings', { params: { listing_purpose: 'sale' } })
      .then(r => setSaleListings(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {t('hero_badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {t('hero_title1')}<br />
            <span className="text-yellow-300">{t('hero_title2')}</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">{t('hero_sub')}</p>

          {/* Quick search */}
          <form onSubmit={runQuickSearch} className="max-w-3xl mx-auto mb-10 bg-white rounded-2xl shadow-xl p-3 flex flex-col sm:flex-row gap-2">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              <button type="button" onClick={() => setQuickMode('rent')}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${quickMode === 'rent' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {t('nav_rent')}
              </button>
              <button type="button" onClick={() => setQuickMode('sale')}
                className={`px-4 py-2.5 text-sm font-semibold transition-colors ${quickMode === 'sale' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {t('nav_buy')}
              </button>
            </div>
            <select value={quickCity} onChange={e => setQuickCity(e.target.value)}
              className="flex-shrink-0 sm:w-44 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">{t('hero_all_cities')}</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="text" value={quickSearch} onChange={e => setQuickSearch(e.target.value)}
              placeholder={t('filter_keyword_ph')}
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button type="submit"
              className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('hero_search')}
            </button>
          </form>

          {/* Two big choice cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* Rent card */}
            <Link to="/listings"
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 hover:border-white/60 rounded-2xl p-8 text-start transition-all duration-200 hover:scale-[1.02]">
              <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-400 transition-colors">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('hero_rent_card_title')}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{t('hero_rent_card_sub')}</p>
              <span className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl group-hover:bg-yellow-300 group-hover:text-gray-900 transition-colors">
                {t('hero_rent_card_btn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>

            {/* Buy card */}
            <Link to="/buy"
              className="group bg-yellow-400/10 hover:bg-yellow-400/20 backdrop-blur-sm border-2 border-yellow-400/30 hover:border-yellow-400/70 rounded-2xl p-8 text-start transition-all duration-200 hover:scale-[1.02]">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-yellow-300 transition-colors">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t('hero_buy_card_title')}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-5">{t('hero_buy_card_sub')}</p>
              <span className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl group-hover:bg-yellow-300 transition-colors">
                {t('hero_buy_card_btn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: t('stat_listings'), value: `${rentListings.length + saleListings.length}+`, icon: '🏠' },
            { label: t('stat_cities'),   value: '10+', icon: '🗺️' },
            { label: t('stat_types'),    value: '6',   icon: '🏗️' },
            { label: t('stat_verified'), value: '100%', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-2xl font-bold text-primary-600">{s.value}</span>
              <span className="text-sm text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest Rentals ───────────────────────────────────── */}
      {rentListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {t('rent_badge')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('featured_rent_title')}</h2>
              <p className="text-gray-500 mt-1">{t('featured_rent_sub')}</p>
            </div>
            <Link to="/listings" className="btn-secondary text-sm hidden md:block">{t('view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentListings.map(l => <ListingCard key={l.id || l._id} listing={l} />)}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/listings" className="btn-primary">{t('view_all_btn')}</Link>
          </div>
        </section>
      )}

      {/* ── Latest For Sale ──────────────────────────────────── */}
      {saleListings.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {t('sale_badge')}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('featured_sale_title')}</h2>
                <p className="text-gray-500 mt-1">{t('featured_sale_sub')}</p>
              </div>
              <Link to="/buy" className="btn-secondary text-sm hidden md:block">{t('view_all')}</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {saleListings.map(l => <ListingCard key={l.id || l._id} listing={l} />)}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link to="/buy" className="btn-primary">{t('view_all_btn')}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('how_title')}</h2>
            <p className="text-gray-500 mt-2">{t('how_sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: t('how_step1_title'), desc: t('how_step1_desc'), icon: '👤' },
              { step: '02', title: t('how_step2_title'), desc: t('how_step2_desc'), icon: '🔍' },
              { step: '03', title: t('how_step3_title'), desc: t('how_step3_desc'), icon: '📞' },
            ].map(item => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-5xl font-extrabold text-gray-100 absolute top-4 end-6 select-none">{item.step}</span>
                <span className="text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
          <p className="text-white/80 mb-8 text-lg">{t('cta_sub')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create-listing" className="inline-block bg-white hover:bg-gray-100 text-primary-700 font-bold px-8 py-3 rounded-xl transition-colors text-lg shadow-lg">
              {lang === 'ar' ? 'نشر إيجار' : 'Post a Rental'}
            </Link>
            <Link to="/sell-listing" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl transition-colors text-lg shadow-lg">
              {lang === 'ar' ? 'نشر للبيع' : 'Post for Sale'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>{t('footer').replace('{year}', new Date().getFullYear())}</p>
        <p className="mt-2">
          <Link to="/terms" className="text-gray-500 hover:text-white transition-colors underline">
            {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </Link>
        </p>
      </footer>
    </div>
  );
}

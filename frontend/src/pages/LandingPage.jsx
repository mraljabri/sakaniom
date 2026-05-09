import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t, lang, CITIES, TYPES } = useLanguage();
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get('/api/listings').then(r => setFeatured(r.data.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('property_type', type);
    if (bedrooms) params.set('bedrooms', bedrooms);
    navigate(`/listings?${params.toString()}`);
  };

  const bedroomOptions = [
    { value: '0', label: t('hero_studio') },
    { value: '1', label: `1 ${t('hero_bedroom')}` },
    { value: '2', label: `2 ${t('hero_bedrooms')}` },
    { value: '3', label: `3 ${t('hero_bedrooms')}` },
    { value: '4', label: `4 ${t('hero_bedrooms')}` },
    { value: '4+', label: `4+ ${t('hero_bedrooms')}` },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {t('hero_badge')}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {t('hero_title1')}<br />
            <span className="text-gold-400">{t('hero_title2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">{t('hero_sub')}</p>

          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-3 md:p-4 max-w-3xl mx-auto shadow-2xl flex flex-col md:flex-row gap-3">
            <select value={city} onChange={e => setCity(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">{t('hero_all_cities')}</option>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">{t('hero_all_types')}</option>
              {TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
            </select>
            <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">{t('hero_any_beds')}</option>
              {bedroomOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2 justify-center whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('hero_search')}
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: t('stat_listings'), value: `${featured.length || 0}+`, icon: '🏠' },
            { label: t('stat_cities'),   value: '10+',  icon: '🗺️' },
            { label: t('stat_types'),    value: '5',    icon: '🏗️' },
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

      {/* Featured Listings */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('featured_title')}</h2>
              <p className="text-gray-500 mt-1">{t('featured_sub')}</p>
            </div>
            <Link to="/listings" className="btn-secondary text-sm hidden md:block">{t('view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link to="/listings" className="btn-primary">{t('view_all_btn')}</Link>
          </div>
        </section>
      )}

      {/* How it works */}
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

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-600 py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t('cta_title')}</h2>
          <p className="text-white/80 mb-8 text-lg">{t('cta_sub')}</p>
          <Link to="/signup" className="inline-block bg-gold-400 hover:bg-gold-500 text-gray-900 font-bold px-8 py-3 rounded-xl transition-colors text-lg shadow-lg">
            {t('cta_btn')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>{t('footer', { year: new Date().getFullYear() })}</p>
        <p className="mt-2">
          <Link to="/terms" className="text-gray-500 hover:text-white transition-colors underline">
            {lang === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </Link>
        </p>
      </footer>
    </div>
  );
}

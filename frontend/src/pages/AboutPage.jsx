import React from 'react';
import { Link } from 'react-router-dom';
import PhotoBanner from '../components/PhotoBanner';
import { useLanguage } from '../contexts/LanguageContext';
import { HERO_SLIDES } from '../assets/oman';

// Public page: what SakaniOM is and what it is for.
export default function AboutPage() {
  const { t } = useLanguage();
  const pillars = [
    { icon: '🏠', title: t('about_rent_title'),  desc: t('about_rent_desc') },
    { icon: '🏡', title: t('about_buy_title'),   desc: t('about_buy_desc') },
    { icon: '🛡️', title: t('about_trust_title'), desc: t('about_trust_desc') },
  ];
  return (
    <div>
      <PhotoBanner src={HERO_SLIDES[2]} className="min-h-[14rem] sm:min-h-[18rem] flex items-end">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8 text-white hero-text">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{t('about_title')}</h1>
          <p className="text-white/85 mt-2">{t('about_tag')}</p>
        </div>
      </PhotoBanner>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="prose-sm text-gray-700 space-y-4 text-base leading-relaxed">
          <p>{t('about_p1')}</p>
          <p>{t('about_p2')}</p>
          <p>{t('about_p3')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {pillars.map(p => (
            <div key={p.title} className="card p-5">
              <span className="text-3xl block mb-3">{p.icon}</span>
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/listings" className="btn-primary">{t('about_cta')}</Link>
        </div>
      </div>
    </div>
  );
}

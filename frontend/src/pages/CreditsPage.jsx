import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import credits from '../data/photo-credits.json';
import * as photos from '../assets/oman';

const THUMB = {
  'hero-mosque.webp': photos.HERO_SLIDES[0], 'hero-dunes.webp': photos.HERO_SLIDES[1],
  'hero-wadi.webp': photos.HERO_SLIDES[2],   'hero-fjords.webp': photos.HERO_SLIDES[3],
  'card-rent.webp': photos.cardRent,         'card-buy.webp': photos.cardBuy,
  'header-rent.webp': photos.headerRent,     'header-buy.webp': photos.headerBuy,
  'cta-salalah.webp': photos.ctaSalalah,     'auth-mosque.webp': photos.authMosque,
};

// Attribution page for the Creative Commons photography used in the app.
export default function CreditsPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900">{t('credits_title')}</h1>
      <p className="text-gray-500 mt-1 mb-8">{t('credits_intro')}</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {credits.map(c => (
          <li key={c.file} className="card flex gap-4 p-3">
            <img src={THUMB[c.file]} alt="" loading="lazy" className="w-28 h-20 object-cover rounded-xl flex-shrink-0" />
            <div className="min-w-0 text-sm">
              <a href={c.source} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 break-words">{c.title}</a>
              <p className="text-gray-600 mt-1">{c.artist}</p>
              <p className="text-gray-400 text-xs mt-0.5">{c.license} · Wikimedia Commons</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

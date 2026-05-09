import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang(l => l === 'en' ? 'ar' : 'en');

  // t(key, vars?) — resolve a translation key, optionally interpolating {var} placeholders
  const t = (key, vars) => {
    let str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    }
    return str;
  };

  const isRTL = lang === 'ar';

  // Localized city list (value stays English for the API, label is translated)
  const CITIES = [
    { value: 'Muscat',  label: t('city_muscat') },
    { value: 'Salalah', label: t('city_salalah') },
    { value: 'Sohar',   label: t('city_sohar') },
    { value: 'Nizwa',   label: t('city_nizwa') },
    { value: 'Sur',     label: t('city_sur') },
    { value: 'Buraimi', label: t('city_buraimi') },
    { value: 'Ibri',    label: t('city_ibri') },
    { value: 'Rustaq',  label: t('city_rustaq') },
    { value: 'Bahla',   label: t('city_bahla') },
    { value: 'Khasab',  label: t('city_khasab') },
  ];

  const TYPES = [
    { value: 'Apartment', label: t('Apartment') },
    { value: 'Villa',     label: t('Villa') },
    { value: 'Studio',    label: t('Studio') },
    { value: 'Townhouse', label: t('Townhouse') },
    { value: 'Penthouse', label: t('Penthouse') },
  ];

  const FURNISHED_OPTIONS = [
    { value: 'furnished',      label: t('furnished') },
    { value: 'semi-furnished', label: t('semi_furnished') },
    { value: 'unfurnished',    label: t('unfurnished') },
  ];

  return (
    <LanguageContext.Provider value={{ lang, toggle, t, isRTL, CITIES, TYPES, FURNISHED_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

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
    { value: 'Hotel',     label: t('Hotel') },
  ];

  const PRICE_PERIODS = [
    { value: 'month', label: t('period_month') },
    { value: 'week',  label: t('period_week') },
    { value: 'day',   label: t('period_day') },
  ];

  const CONTRACT_OPTIONS = [
    { value: '', label: isRTL ? '— اختر مدة العقد —' : '— Select contract period —' },
    { value: 'no_contract', label: t('contract_no_contract') },
    { value: '1_month',     label: t('contract_1_month') },
    { value: '3_months',    label: t('contract_3_months') },
    { value: '6_months',    label: t('contract_6_months') },
    { value: '1_year',      label: t('contract_1_year') },
    { value: '2_years',     label: t('contract_2_years') },
  ];

  const FAMILY_OPTIONS = [
    { value: '', label: isRTL ? '— اختر —' : '— Select —' },
    { value: 'both',       label: t('family_both') },
    { value: 'family',     label: t('family_family') },
    { value: 'non_family', label: t('family_non_family') },
  ];

  const PAYMENT_OPTIONS = [
    { value: '', label: isRTL ? '— اختر طريقة الدفع —' : '— Select payment method —' },
    { value: 'cash',          label: t('payment_cash') },
    { value: 'check',         label: t('payment_check') },
    { value: 'bank_transfer', label: t('payment_bank_transfer') },
    { value: 'other',         label: t('payment_other') },
  ];

  const FURNISHED_OPTIONS = [
    { value: 'furnished',      label: t('furnished') },
    { value: 'semi-furnished', label: t('semi_furnished') },
    { value: 'unfurnished',    label: t('unfurnished') },
  ];

  const OWNERSHIP_TYPES = [
    { value: '',                  label: isRTL ? '— اختر نوع الملكية —' : '— Select ownership type —' },
    { value: 'freehold',          label: t('ownership_freehold') },
    { value: 'leasehold',         label: t('ownership_leasehold') },
    { value: 'investment_zone',   label: t('ownership_investment') },
    { value: 'other',             label: t('ownership_other') },
  ];

  const SELLER_TYPES = [
    { value: '',      label: isRTL ? '— اختر نوع البائع —' : '— Select seller type —' },
    { value: 'owner', label: t('seller_owner') },
    { value: 'agent', label: t('seller_agent') },
  ];

  return (
    <LanguageContext.Provider value={{ lang, toggle, t, isRTL, CITIES, TYPES, FURNISHED_OPTIONS, PRICE_PERIODS, CONTRACT_OPTIONS, FAMILY_OPTIONS, PAYMENT_OPTIONS, OWNERSHIP_TYPES, SELLER_TYPES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Two-step Oman location picker: Governorate → Wilayat (city).
 *
 *   mode="filter"  first options are "All governorates" / "All wilayats in X";
 *                  the wilayat select only appears once a governorate is chosen.
 *   mode="form"    both selects are required with "— Select —" placeholders.
 *
 * onChange receives { governorate, city }. Changing the governorate always
 * clears the city so the two can never disagree.
 */
export default function LocationPicker({
  governorate = '',
  city = '',
  onChange,
  mode = 'form',
  selectClass = 'input',
  labels = true,
  stacked = true,
  required = false,
}) {
  const { t, GOVERNORATES } = useLanguage();
  const isFilter = mode === 'filter';
  const gov = GOVERNORATES.find(g => g.value === governorate);
  const wilayats = gov ? gov.wilayats : [];

  const pickGov = e => onChange({ governorate: e.target.value, city: '' });
  const pickCity = e => onChange({ governorate, city: e.target.value });

  return (
    <div className={stacked ? 'space-y-3' : 'flex gap-2'}>
      <div className={stacked ? '' : 'flex-1 min-w-0'}>
        {labels && <label className="label">{t('field_governorate')}{required && ' *'}</label>}
        <select className={selectClass} value={governorate} onChange={pickGov} required={required}>
          <option value="">{isFilter ? t('filter_all_governorates') : t('select_governorate')}</option>
          {GOVERNORATES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {(gov || !isFilter) && (
        <div className={stacked ? '' : 'flex-1 min-w-0'}>
          {labels && <label className="label">{t('field_wilayat')}{required && ' *'}</label>}
          <select className={selectClass} value={city} onChange={pickCity} required={required} disabled={!gov}>
            {!gov ? (
              <option value="">{t('pick_governorate_first')}</option>
            ) : (
              <option value="">{isFilter ? t('filter_all_wilayats', { g: gov.label }) : t('select_wilayat')}</option>
            )}
            {wilayats.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}

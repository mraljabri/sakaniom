import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import { mediaUrl, PLACEHOLDER } from '../utils/media';

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}

export default function EditListingPage() {
  const { id } = useParams();
  const { t, CITIES, TYPES, FURNISHED_OPTIONS, PRICE_PERIODS, CONTRACT_OPTIONS, FAMILY_OPTIONS, PAYMENT_OPTIONS } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [videoNames, setVideoNames] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'Apartment', city: 'Muscat',
    neighborhood: '', price: '', price_period: 'month', bedrooms: '1', bathrooms: '1',
    area_sqm: '', furnished: 'unfurnished', contact_name: '', contact_phone: '', contact_email: '',
  });

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(r => {
        const l = r.data;
        setForm({
          title: l.title || '',
          description: l.description || '',
          property_type: l.property_type || 'Apartment',
          city: l.city || 'Muscat',
          neighborhood: l.neighborhood || '',
          price: l.price || '',
          price_period: l.price_period || 'month',
          bedrooms: String(l.bedrooms ?? '1'),
          bathrooms: String(l.bathrooms ?? '1'),
          area_sqm: l.area_sqm || '',
          furnished: l.furnished || 'unfurnished',
          contract_period: l.contract_period || 'no_contract',
          family_status: l.family_status || 'both',
          payment_method: l.payment_method || 'cash',
          contact_name: l.contact_name || '',
          contact_phone: l.contact_phone || '',
          contact_email: l.contact_email || '',
        });
        setExistingPhotos(l.photos || []);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleNewPhotos = (e) => {
    const files = Array.from(e.target.files);
    setNewPhotos(files);
    setNewPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleNewVideos = (e) => {
    const files = Array.from(e.target.files);
    setNewVideos(files);
    setVideoNames(files.map(f => f.name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') data.append(k, v); });
      newPhotos.forEach(f => data.append('photos', f));
      newVideos.forEach(f => data.append('videos', f));

      await axios.put(`/api/listings/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update listing.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('edit_title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('edit_sub')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title={t('section_property')}>
          <div className="space-y-4">
            <div>
              <label className="label">{t('field_listing_title')} *</label>
              <input className="input" type="text" placeholder={t('field_listing_title_ph')} value={form.title} onChange={set('title')} required maxLength={120} />
            </div>
            <div>
              <label className="label">{t('field_description')}</label>
              <textarea className="input min-h-[120px] resize-y" placeholder={t('field_description_ph')} value={form.description} onChange={set('description')} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('field_type')} *</label>
                <select className="input" value={form.property_type} onChange={set('property_type')} required>
                  {TYPES.map(tp => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t('field_furnished_status')} *</label>
                <select className="input" value={form.furnished} onChange={set('furnished')} required>
                  {FURNISHED_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Section>

        <Section title={t('section_location')}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('field_city')} *</label>
              <select className="input" value={form.city} onChange={set('city')} required>
                {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('field_neighborhood')}</label>
              <input className="input" type="text" placeholder={t('field_neighborhood_ph')} value={form.neighborhood} onChange={set('neighborhood')} />
            </div>
          </div>
        </Section>

        <Section title={t('section_specs')}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">{t('field_price')} *</label>
              <input className="input" type="number" placeholder={t('field_price_ph')} value={form.price} onChange={set('price')} required min="1" />
            </div>
            <div>
              <label className="label">{t('field_price_period')} *</label>
              <select className="input" value={form.price_period} onChange={set('price_period')} required>
                {PRICE_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('field_beds')} *</label>
              <select className="input" value={form.bedrooms} onChange={set('bedrooms')} required>
                <option value="0">{t('hero_studio')}</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('field_baths')} *</label>
              <select className="input" value={form.bathrooms} onChange={set('bathrooms')} required>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">{t('field_area_sqm')}</label>
              <input className="input" type="number" placeholder={t('field_area_sqm_ph')} value={form.area_sqm} onChange={set('area_sqm')} min="1" />
            </div>
          </div>
        </Section>

        <Section title={t('section_terms')}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">{t('field_contract')}</label>
              <select className="input" value={form.contract_period} onChange={set('contract_period')}>
                {CONTRACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('field_family')}</label>
              <select className="input" value={form.family_status} onChange={set('family_status')}>
                {FAMILY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('field_payment')}</label>
              <select className="input" value={form.payment_method} onChange={set('payment_method')}>
                {PAYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <Section title={t('section_photos')}>
          {existingPhotos.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current photos — upload new ones below to replace them:</p>
              <div className="flex gap-2 flex-wrap">
                {existingPhotos.map((src, i) => (
                  <img key={i} src={mediaUrl(src)} alt="" onError={e => { e.target.src = PLACEHOLDER; }}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('edit-photo-input').click()}>
            <input id="edit-photo-input" type="file" accept="image/*" multiple className="hidden" onChange={handleNewPhotos} />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">{t('photo_upload_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('photo_upload_hint')}</p>
          </div>
          {newPhotoPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
              {newPhotoPreviews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title={t('section_videos')}>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('edit-video-input').click()}>
            <input id="edit-video-input" type="file" accept="video/*" multiple className="hidden" onChange={handleNewVideos} />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">{t('video_upload_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('video_upload_hint')}</p>
          </div>
          {videoNames.length > 0 && (
            <ul className="mt-3 space-y-1">
              {videoNames.map((n, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
                  {n}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={t('section_contact')}>
          <div className="space-y-4">
            <div>
              <label className="label">{t('field_contact_name')} *</label>
              <input className="input" type="text" placeholder={t('field_contact_name_ph')} value={form.contact_name} onChange={set('contact_name')} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{t('field_contact_phone')} *</label>
                <input className="input" type="tel" placeholder={t('field_phone_ph')} value={form.contact_phone} onChange={set('contact_phone')} required />
              </div>
              <div>
                <label className="label">{t('field_contact_email')} <span className="text-gray-400">{t('field_optional')}</span></label>
                <input className="input" type="email" placeholder={t('field_email_ph')} value={form.contact_email} onChange={set('contact_email')} />
              </div>
            </div>
          </div>
        </Section>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(`/listings/${id}`)} className="btn-secondary flex-1">{t('btn_cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {t('btn_saving')}
              </span>
            ) : t('btn_save')}
          </button>
        </div>
      </form>
    </div>
  );
}

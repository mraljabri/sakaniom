import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function CreateListingPage() {
  const { user } = useAuth();
  const { t, CITIES, TYPES, FURNISHED_OPTIONS } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoNames, setVideoNames] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', property_type: 'Apartment', city: 'Muscat',
    neighborhood: '', price: '', bedrooms: '1', bathrooms: '1',
    area_sqm: '', furnished: 'unfurnished',
    contact_name: user?.name || '', contact_phone: '', contact_email: user?.email || '',
  });
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files);
    setVideos(files);
    setVideoNames(files.map(f => f.name));
  };

  const removePhoto = (idx) => {
    setPhotos(ps => ps.filter((_, i) => i !== idx));
    setPhotoPreviews(ps => ps.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      photos.forEach(f => data.append('photos', f));
      videos.forEach(f => data.append('videos', f));

      const { data: res } = await axios.post('/api/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/listings/${res.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('create_title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('create_sub')}</p>
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
            <div>
              <label className="label">{t('field_area_sqm')}</label>
              <input className="input" type="number" placeholder={t('field_area_sqm_ph')} value={form.area_sqm} onChange={set('area_sqm')} min="1" />
            </div>
          </div>
        </Section>

        <Section title={t('section_photos')}>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('photo-input').click()}>
            <input id="photo-input" type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">{t('photo_upload_label')}</p>
            <p className="text-xs text-gray-400 mt-1">{t('photo_upload_hint')}</p>
          </div>
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 end-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  {i === 0 && <span className="absolute bottom-1 start-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">{t('cover_label')}</span>}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title={t('section_videos')}>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('video-input').click()}>
            <input id="video-input" type="file" accept="video/*" multiple className="hidden" onChange={handleVideos} />
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
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">{t('btn_cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {t('btn_publishing')}
              </span>
            ) : t('btn_publish')}
          </button>
        </div>
      </form>
    </div>
  );
}

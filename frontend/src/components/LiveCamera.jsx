import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Captures a photo from the device camera right now (no gallery), for the
 * identity selfie. Uses getUserMedia; if that is unavailable or denied, falls
 * back to a file input with capture="user", which opens the camera directly
 * on phones.
 *
 * onCapture(blob | null) — null when the user retakes.
 */
export default function LiveCamera({ onCapture }) {
  const { t } = useLanguage();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [state, setState] = useState('starting'); // starting | live | error
  const [shot, setShot] = useState(null);          // data URL preview

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setState('error');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(tr => tr.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => {}); }
        setState('live');
      } catch { setState('error'); }
    };
    if (!shot) start();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach(tr => tr.stop()); streamRef.current = null; };
  }, [shot]);

  const take = () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth || 1280; c.height = v.videoHeight || 720;
    const ctx = c.getContext('2d');
    // Mirror back so the saved image is not flipped like the preview.
    ctx.translate(c.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob(blob => { setShot(c.toDataURL('image/jpeg', 0.9)); onCapture(blob); }, 'image/jpeg', 0.9);
  };
  const retake = () => { setShot(null); onCapture(null); };
  const fallback = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setShot(URL.createObjectURL(f)); onCapture(f);
  };

  if (shot) return (
    <div className="space-y-3">
      <img src={shot} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl bg-black" />
      <button type="button" onClick={retake} className="btn-secondary w-full">{t('vi_retake')}</button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black">
        <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover -scale-x-100" />
        {state === 'starting' && <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">{t('vi_camera_starting')}</p>}
        {state === 'error' && <p className="absolute inset-0 flex items-center justify-center text-white/90 text-sm p-6 text-center">{t('vi_camera_error')}</p>}
        {/* Face guide */}
        {state === 'live' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[55%] aspect-[3/4] rounded-[50%] border-2 border-white/70" /></div>}
      </div>
      {state === 'live' ? (
        <button type="button" onClick={take} className="btn-primary w-full">📸 {t('vi_take_photo')}</button>
      ) : (
        <label className="btn-primary w-full cursor-pointer">
          📸 {t('vi_take_photo')}
          <input type="file" accept="image/*" capture="user" onChange={fallback} className="hidden" />
        </label>
      )}
    </div>
  );
}

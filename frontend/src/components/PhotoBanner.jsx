import React from 'react';

/**
 * Full-width photo banner with a dark gradient so white text stays legible.
 * Used for page headers (browse pages) and section backdrops (CTA).
 */
export default function PhotoBanner({ src, alt = '', className = '', overlay = 'from-primary-900/85 via-primary-900/55 to-primary-900/30', children }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-t ${overlay}`} />
      <div className="relative">{children}</div>
    </div>
  );
}

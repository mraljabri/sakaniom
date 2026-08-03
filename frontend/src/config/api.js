import { Capacitor } from '@capacitor/core';

// Production API origin used by the native builds. The web build talks to its
// own origin, but a native web view is served from https://localhost, so every
// relative /api call there has to be pointed at the real server explicitly.
export const PRODUCTION_API = import.meta.env.VITE_API_URL || 'https://sakaniom.onrender.com';

export const isNative = Capacitor.isNativePlatform();

export function resolveBaseURL() {
  if (isNative) return PRODUCTION_API;
  // Web: same origin in production, Vite proxy in dev.
  return import.meta.env.VITE_API_URL || '';
}

import { Capacitor } from '@capacitor/core';

// Production API origin used by the native builds. The web build talks to its
// own origin, but a native web view is served from https://localhost, so every
// relative /api call there has to be pointed at the real server explicitly.
export const PRODUCTION_API = import.meta.env.VITE_API_URL || 'https://sakaniom.onrender.com';

// True only inside the Capacitor shell (real device or emulator).
export const isNative = Capacitor.isNativePlatform();

// True when the app-style UI (tab bar, bottom sheets, page transitions) should
// render. Always true natively; in a dev build it can also be switched on in
// the browser with ?native=1 so the shell can be previewed without a device.
// The query-param branch is stripped from production bundles.
export const isAppShell =
  isNative ||
  (import.meta.env.DEV && new URLSearchParams(window.location.search).has('native'));

export function resolveBaseURL() {
  if (isNative) return PRODUCTION_API;
  // Web: same origin in production, Vite proxy in dev.
  return import.meta.env.VITE_API_URL || '';
}

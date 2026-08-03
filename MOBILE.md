# SakaniOM Mobile (Capacitor)

The native apps reuse the existing React build — no separate codebase. The web
app in `frontend/` is compiled to `dist/`, then wrapped in a native shell.

App ID: `com.sakaniom.app`

## Prerequisites

Android (buildable on Windows):

1. Install [Android Studio](https://developer.android.com/studio). It bundles
   the JDK and Android SDK.
2. First launch: **More Actions → SDK Manager**, install the current
   "Android SDK Platform" and "Android SDK Build-Tools".
3. Restart your terminal so `JAVA_HOME` and the SDK path are picked up.

iOS requires macOS and Xcode. It cannot be built from Windows — use a cloud
build service (Codemagic, Expo EAS) or a Mac.

## Everyday workflow

Any time web code changes, the native shell needs the fresh build copied in:

```bash
cd frontend && npm run cap:android
```

That builds, syncs `dist/` into the Android project, and opens Android Studio.
Press Run to deploy to an emulator or a USB-connected phone.

To skip Android Studio and deploy straight to a connected device:

```bash
cd frontend && npm run cap:run
```

## How the API connection works

The web build is same-origin, so it uses relative `/api` paths. A native web
view is served from `https://localhost`, so those paths would 404. `src/config/api.js`
detects the native platform and points axios at the production origin instead.

To target a different backend, set `VITE_API_URL` at build time:

```bash
VITE_API_URL=https://staging.example.com npm run cap:sync
```

The backend allows the Capacitor web-view origins (`https://localhost`,
`capacitor://localhost`) in `backend/server.js`. If you add a new scheme,
add it to `allowedOrigins` there too.

## Before submitting to the stores

Already done:

- [x] In-app account deletion (Apple Guideline 5.1.1(v) — mandatory)
- [x] Android back button handling
- [x] Safe-area insets for notched devices

Still needed:

- [ ] **App icon and splash art.** Capacitor ships placeholders. Generate real
      ones with `@capacitor/assets` from a 1024x1024 source image.
- [ ] **Native features.** Apple Guideline 4.2 rejects apps that are only a
      website wrapper. Push notifications and native camera capture are the two
      highest-value additions for this app.
- [ ] **Privacy policy URL.** Required by both stores. Must be publicly reachable.
- [ ] **Signing key.** Generate a release keystore, store it outside the repo,
      and never commit it — `.gitignore` already excludes `*.jks`/`*.keystore`.
- [ ] **Store listing.** Screenshots at required sizes, description, category.
- [ ] Google Play data-safety form / Apple privacy nutrition labels.

## Accounts

| Store | Cost | Notes |
|---|---|---|
| Google Play | $25 one-time | New *personal* accounts must run a 14-day closed test with 12 testers before production. Organization accounts are exempt. |
| Apple App Store | $99/year | Requires macOS to build and submit. |

import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { isNative, isAppShell } from './config/api';

export function initNative() {
  // App-style chrome (tab bar, sheets, transitions). Also on in dev with ?native=1.
  if (isAppShell) document.documentElement.classList.add('app-shell');

  // Everything below needs the real Capacitor runtime.
  if (!isNative) return;

  document.documentElement.classList.add('native-app');

  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#1d4ed8' }).catch(() => {});
  SplashScreen.hide().catch(() => {});

  // Android hardware back: walk the router history, and only close the app
  // once there is nowhere left to go back to.
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack || window.history.length > 1) window.history.back();
    else App.exitApp();
  });
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { setServiceWorkerUpdater } from './lib/versionCheck';
import './index.css';

// v2.4.16 (H-H3): wire the service worker's "new version waiting" signal
// into the app's existing version check. App.tsx already re-checks the
// served bundle hash on window focus / visibilitychange (handleCheckVersion,
// guarded to prompt at most once per deploy), so the SW event re-triggers
// that same path with a synthetic focus event instead of inventing a second
// prompt or a version number. Note: with registerType 'autoUpdate' the SW
// may activate without ever reporting a waiting worker, in which case this
// callback simply never fires — the focus/poll hash check in App.tsx is
// still the real detector and catches the new deploy on its own.
//
// v2.4.25: capture the updateSW function so reloadForUpdate() (used by
// the Version Update modal's "ပြန်ဖွင့်မည်" button) can use the canonical
// vite-plugin-pwa path when available. Verified against the installed
// vite-plugin-pwa 1.3.0 client source: in autoUpdate mode updateSW() only
// awaits registration — the manual registration.update() + controllerchange
// wait inside reloadForUpdate() is what actually lands the update.
const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new Event('focus'));
  },
});
setServiceWorkerUpdater(updateSW);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

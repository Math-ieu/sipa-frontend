import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Désenregistrement de tout service worker actif et nettoyage du Cache Storage de la PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('🗑️ Service Worker unregistré avec succès !');
        }
      });
    }
  });
}

if ('caches' in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      caches.delete(cacheName).then((success) => {
        if (success) {
          console.log(`🗑️ Cache ${cacheName} supprimé avec succès !`);
        }
      });
    });
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker for PWA offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✅ SIPA Service Worker enregistré avec succès ! Portée :', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Échec de l\'enregistrement du Service Worker :', err);
      });
  });
}

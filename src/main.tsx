import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPwaListeners } from './utils/pwa';

// Initialisation de la Progressive Web App (Service Worker + détection d'installation)
initPwaListeners();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

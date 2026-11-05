/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function canTriggerNativeInstall(): boolean {
  return deferredPrompt !== null;
}

export async function triggerPwaInstall(): Promise<'accepted' | 'dismissed' | 'manual'> {
  if (!deferredPrompt) {
    return 'manual';
  }
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('sipa_pwa_state_change'));
    }
    return choice.outcome;
  } catch {
    return 'manual';
  }
}

export function initPwaListeners(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('sipa_pwa_state_change'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('sipa_pwa_state_change'));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch((err) => {
          console.error('Erreur lors de l\'enregistrement du Service Worker SIPA:', err);
        });
    });
  }
}


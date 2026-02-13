'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ServiceWorkerRegistration() {
  const { toast } = useToast();
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  const showUpdateToast = useCallback(
    (registration: ServiceWorkerRegistration) => {
      toast({
        title: 'Update available',
        description: 'A new version of E-Moorm is ready. Tap to refresh.',
        duration: 10000,
        action: (
          <button
            className="rounded-md bg-black px-3 py-1 text-xs font-medium text-white"
            onClick={() => {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }}
          >
            Update
          </button>
        ),
      });
    },
    [toast]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // In dev mode with Turbopack, skip SW registration to avoid caching issues
    if (process.env.NODE_ENV === 'development') {
      // Unregister any stale SW in dev
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
      });
      return;
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registrationRef.current = registration;
        console.log('Service Worker registered:', registration.scope);

        // If there's a waiting worker already, show update prompt
        if (registration.waiting) {
          showUpdateToast(registration);
        }

        // Listen for new worker arriving
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available — prompt user
              showUpdateToast(registration);
            }
          });
        });

        // Periodic update check (every 60s)
        const interval = setInterval(() => registration.update(), 60_000);
        return () => clearInterval(interval);
      })
      .catch((err) => {
        console.error('SW registration failed:', err);
      });

    // Reload when a new SW takes over
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, [showUpdateToast]);

  return null;
}

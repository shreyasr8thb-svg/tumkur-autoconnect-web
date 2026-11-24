import { useState, useEffect } from 'react';

/**
 * useHashTab – Clean tab state manager with browser history/back-button support.
 * Keeps the browser address bar 100% clean (no '#' or hash fragments).
 */
export function useHashTab(defaultTab = 'home') {
  const [tab, setTabState] = useState(() => {
    if (typeof window === 'undefined') return defaultTab;
    const initialHash = window.location.hash.replace('#', '');
    // Clean URL immediately if user landed with a hash
    if (window.location.hash) {
      try {
        window.history.replaceState({ tab: initialHash || defaultTab }, '', window.location.pathname + window.location.search);
      } catch (e) {}
    }
    return initialHash || defaultTab;
  });

  const setTab = (newTab) => {
    if (newTab !== tab) {
      setTabState(newTab);
      if (typeof window !== 'undefined') {
        try {
          // Push state for back button navigation WITHOUT adding '#' to URL
          window.history.pushState({ tab: newTab }, '', window.location.pathname + window.location.search);
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediately sanitize address bar if any '#' exists
    if (window.location.hash) {
      window.history.replaceState({ tab }, '', window.location.pathname + window.location.search);
    }

    const handlePopState = (e) => {
      // If user presses browser/device back button, restore previous tab state
      const targetTab = e.state?.tab || defaultTab;
      setTabState(targetTab);

      // Keep address bar clean
      if (window.location.hash) {
        window.history.replaceState({ tab: targetTab }, '', window.location.pathname + window.location.search);
      }
    };

    const handleHashChange = () => {
      // Strip any hash that might be injected
      if (window.location.hash) {
        const h = window.location.hash.replace('#', '');
        if (h) setTabState(h);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [defaultTab, tab]);

  return [tab, setTab];
}

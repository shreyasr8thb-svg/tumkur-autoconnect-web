import { useState, useEffect } from 'react';

export function useHashTab(defaultTab = 'home') {
  const [tab, setTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || defaultTab;
  });

  const setTab = (newTab) => {
    if (newTab !== tab) {
      if (newTab === defaultTab || newTab === 'home') {
        // Keep the address bar clean without '#home'
        if (window.location.hash) {
          window.history.pushState(null, '', window.location.pathname + window.location.search);
        }
        setTabState(defaultTab);
      } else {
        window.location.hash = newTab;
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const active = hash || defaultTab;
      setTabState(active);
      if (active === defaultTab || active === 'home') {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Always remove #home or defaultTab hash if user opens or lands on the page with it
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash === defaultTab || initialHash === 'home') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultTab]);

  return [tab, setTab];
}

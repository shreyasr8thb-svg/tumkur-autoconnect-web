import { useState, useEffect } from 'react';

export function useHashTab(defaultTab = 'home') {
  const [tab, setTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || defaultTab;
  });

  const setTab = (newTab) => {
    if (newTab !== tab) {
      window.location.hash = newTab;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setTabState(hash || defaultTab);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial hash cleanly without adding to history if missing
    if (!window.location.hash) {
      window.history.replaceState(null, '', `#${defaultTab}`);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultTab]);

  return [tab, setTab];
}

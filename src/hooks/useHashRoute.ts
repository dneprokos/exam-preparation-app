import { useState, useEffect, useCallback } from 'react';

function parseHash(hash: string): string | null {
  const id = hash.replace(/^#\/?/, '').split('/')[0];
  return id ? decodeURIComponent(id) : null;
}

export function useHashRoute() {
  const [certId, setCertId] = useState<string | null>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setCertId(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((id: string | null) => {
    window.location.hash = id ? `#/${encodeURIComponent(id)}` : '#/';
  }, []);

  return { certId, navigate };
}

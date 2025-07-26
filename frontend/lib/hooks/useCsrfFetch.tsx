import { useState, useRef } from 'react';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useCsrfFetch() {
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    const csrfReady = useRef(false);
    const [loading, setLoading] = useState(false);

    async function getCsrfCookie() {
        if (csrfReady.current) return; // already fetched
        setLoading(true);
        await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
        });
        csrfReady.current = true;
        setLoading(false);
  }

  async function csrfFetch(input: RequestInfo, init: RequestInit = {}) {
    // For safe HTTP verbs like GET, HEAD, no CSRF needed
    const method = init.method?.toUpperCase() || 'GET';

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (!csrfReady.current) {
        await getCsrfCookie();
      }
      const token = getCookie('XSRF-TOKEN');
      init.credentials = 'include'; // always include cookies
      init.headers = {
        ...(init.headers || {}),
        'X-XSRF-TOKEN': token ? decodeURIComponent(token) : '',
      };
    }

    return fetch(input, init);
  }

  return { csrfFetch, loading };
}
'use client';

import { useEffect, useRef } from 'react';
import { autocomplete } from '@algolia/autocomplete-js';
import '@algolia/autocomplete-theme-classic';
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const containerRef = useRef(null);
  const selectedCategory = useRef(null);
  const router = useRouter();

  function debouncePromise(fn, time) {
    let timer = undefined;

    return function debounced(...args) {
      if (timer) clearTimeout(timer);
      return new Promise((resolve) => {
        timer = setTimeout(() => resolve(fn(...args)), time);
      });
    };
  }

  const DEBOUNCE_MS = 400;
  const debounced = debouncePromise((items) => Promise.resolve(items), DEBOUNCE_MS);

  useEffect(() => {
    if (!containerRef.current) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    let refreshFn = null;

    const search = autocomplete({
      container: containerRef.current,
      placeholder: 'Search...',
      openOnFocus: true,
      getSources({ query, setQuery, refresh }) {
        refreshFn = refresh;

        const trimmedQuery = query?.trim() ?? '';

        // Show category selector
        if (!selectedCategory.current) {
          return [
            {
              sourceId: 'category-select',
              getItems: () => [
                { label: '🎬 Movies', value: 'movies' },
				{ label: '🎬 Anime', value: 'anime' },
                { label: '🎮 Games', value: 'games' },
                { label: '🎵 Music', value: 'music' },
              ],
              templates: {
                item({ item }) {
                  return item.label;
                },
              },
              onSelect({ item }) {
                selectedCategory.current = item.value;
                setQuery('');
                const input = document.querySelector('#autocomplete input');
                if (input) input.focus();
                refresh();
              },
            },
          ];
        }

        // Require at least 2 characters to start searching
        if (trimmedQuery.length < 2) {
          return [];
        }

        if (selectedCategory.current === 'music') {
            const fetchMusicResults = async () => {
                const res = await fetch(`${apiUrl}/api/search/music?q=${encodeURIComponent(trimmedQuery)}`);
                const data = await res.json();
                console.log('Music search results:', data);
                return {
                  artists: data.filter(i => i.type.toLowerCase() === 'artist'),
                  albums:  data.filter(i => i.type.toLowerCase() === 'album'),
                  tracks:  data.filter(i => i.type.toLowerCase() === 'track')
                };
            };

            return debounced([
                {
                sourceId: 'music-artists',
                getItems: async () => (await fetchMusicResults()).artists,
                templates: {
                    header({ html }) { return html`
                        <div id="search-header" style="padding: 6px; font-size: 13px; color: gray; display: flex; justify-content: space-between; align-items: center;">
                        <div>Searching in: <strong>${selectedCategory.current}</strong></div>
                        <button id="clear-category" style="background: none; border: none; color: #888; font-size: 16px; cursor: pointer;">✖</button>
                        </div>
                        <div style="padding: 6px; font-weight: bold;">Artists</div>`; },
                    item({ item, html }) { return html`<div>${item.title}<span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">${item.source}</span></div>`; }
                },
                onSelect({ item }) { router.push(`/media/artist/${item.id}`); }
                },
                {
                sourceId: 'music-albums',
                getItems: async () => (await fetchMusicResults()).albums,
                templates: {
                    header({ html }) { return html`<div style="padding: 6px; font-weight: bold;">Albums</div>`; },
                    item({ item, html }) { return html`<div>${item.title} - ${item.artist}<span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">${item.source}</span></div>`; }
                },
                onSelect({ item }) { router.push(`/media/album/${item.id}`); }
                },
                {
                sourceId: 'music-tracks',
                getItems: async () => (await fetchMusicResults()).tracks,
                templates: {
                    header({ html }) { return html`<div style="padding: 6px; font-weight: bold;">Tracks</div>`; },
                    item({ item, html }) { return html`<div>${item.title}<span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">${item.source}</span></div>`; }
                },
                onSelect({ item }) { router.push(`/media/track/${item.id}`); }
                }
            ]);
        }else{

            return debounced([
                {
                    sourceId: 'search-results',
                    render: true,
                    getItems: async () => {
                    const res = await fetch(
                        `${apiUrl}/api/search/${selectedCategory.current}?q=${encodeURIComponent(trimmedQuery)}`
                    );
                    return res.json();
                    },
                    templates: {
                        header({html}) {
                            return html`
                                <div id="search-header" style="padding: 6px; font-size: 13px; color: gray; display: flex; justify-content: space-between; align-items: center;">
                                <div>Searching in: <strong>${selectedCategory.current}</strong></div>
                                <button id="clear-category" style="background: none; border: none; color: #888; font-size: 16px; cursor: pointer;">✖</button>
                                </div>
                            `;
                        },
                        item({ item, html }) {
                            if(item.source != 'external'){
                                return 	html`<div>${item.title}<span className="ml-2 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">${item.source}</span></div>`;
                            }else{
                                return 	html`<div>${item.title}<span className="ml-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">${item.source}</span></div>`;
                            }
                        },
                    },
                    onSelect({ item }) {
                    const id = item.id;
                    if (!id) return;
                        router.push(`/media/${selectedCategory.current}/${id}`);
                    },
                },
            ]);

        }
    },
    onStateChange() {
        // Enable ✖ button to clear selected category
        setTimeout(() => {
          const resetBtn = document.getElementById('clear-category');
          if (resetBtn) {
            resetBtn.onclick = () => {
              selectedCategory.current = null;
              const input = document.querySelector('#autocomplete input');
              if (input) {
                input.value = '';
                input.focus();
                input.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (refreshFn) refreshFn();
            };
          }
        }, 0);
    },
    });

    return () => search.destroy();
  }, []);

  return <div ref={containerRef} id="autocomplete" />;
}

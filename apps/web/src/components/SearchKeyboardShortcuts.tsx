'use client';

import { useEffect } from 'react';

export function SearchKeyboardShortcuts() {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K or / focuses the search input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('search-input') as HTMLInputElement | null;
        input?.focus();
        return;
      }
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName || '')) {
        e.preventDefault();
        const input = document.getElementById('search-input') as HTMLInputElement | null;
        input?.focus();
        return;
      }
      // Escape blurs the search input
      if (e.key === 'Escape') {
        const input = document.getElementById('search-input') as HTMLInputElement | null;
        if (document.activeElement === input) {
          input?.blur();
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return null;
}

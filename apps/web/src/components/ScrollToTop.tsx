'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from './lovable/icons';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToTop() {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)] text-[var(--muted-foreground)] shadow-lg transition hover:bg-[var(--card)] hover:text-[var(--foreground)]"
    >
      <ChevronUp size={18} strokeWidth={2} />
    </button>
  );
}

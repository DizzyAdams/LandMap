'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'landmap:whatsnew:v2';

/**
 * Dismissible, localStorage-persisted announcement bar.
 * Surfaces product highlights without nagging on every visit.
 */
export function WhatsNewBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // SSR / private mode — show by default.
      setOpen(true);
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore persistence failures
    }
  }

  if (!open) return null;

  return (
    <div className="relative z-50 border-b border-[var(--warning)]/20 bg-[var(--muted)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-2 text-xs">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-2 py-0.5 font-medium text-[var(--warning)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)] shadow-[0_0_8px_var(--ring)]" />
          Novidades
        </span>
        <p className="min-w-0 flex-1 truncate text-[var(--muted-foreground)]">
          LandMap 2.0 — API aberta, agentes de IA ao vivo e mapa interativo
          worldwide. Tudo open-source.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar aviso de novidades"
          className="shrink-0 rounded-md px-2 py-0.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Dispensar
        </button>
      </div>
    </div>
  );
}

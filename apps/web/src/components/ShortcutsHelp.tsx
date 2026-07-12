'use client';

import { useEffect, useState } from 'react';
import { X } from './lovable/icons';

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Focar a busca' },
  { keys: ['/'], label: 'Focar a busca' },
  { keys: ['?'], label: 'Abrir este ajuda' },
  { keys: ['Esc'], label: 'Fechar / sair da busca' },
];

/**
 * Keyboard shortcut help overlay, triggered by "?" (when not typing).
 * Complements the existing Cmd/Crtl+K + "/" search shortcuts.
 */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag || '');
      if (e.key === '?' && !typing) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Atalhos de teclado"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-lovable)] bg-[var(--card)] text-sm text-[var(--muted-foreground-lovable)] backdrop-blur-md transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Atalhos de teclado"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="surface relative w-full max-w-sm rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Atalhos de teclado
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded-md px-2 py-1 text-[var(--muted-foreground-lovable)] transition hover:bg-[var(--muted-lovable)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {shortcuts.map((s) => (
                <li
                  key={s.label + s.keys.join()}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-[var(--muted-foreground-lovable)]">{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border border-[var(--border-lovable)] bg-[var(--muted-lovable)] px-1.5 py-0.5 text-xs text-[var(--foreground)]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

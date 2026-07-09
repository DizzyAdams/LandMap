'use client';

import { useEffect, useState } from 'react';

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Focar a busca' },
  { keys: ['/'], label: 'Focar a busca' },
  { keys: ['?'], label: 'Abrir este ajuda' },
  { keys: ['Esc'], label: 'Fechar / sair da busca' },
];

/**
 * Keyboard shortcut help overlay, triggered by "?" (when not typing).
 * Complements the existing Cmd/Ctrl+K + "/" search shortcuts.
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
        className="fixed bottom-4 right-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-[#0a0a0a]/80 text-sm text-neutral-400 backdrop-blur-md transition hover:border-neutral-500 hover:text-white"
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
          <div className="surface relative w-full max-w-sm rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-100">
                Atalhos de teclado
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="rounded-md px-2 py-1 text-neutral-500 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {shortcuts.map((s) => (
                <li
                  key={s.label + s.keys.join()}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-neutral-400">{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-xs text-neutral-300"
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

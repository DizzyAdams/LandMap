'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '../lib/index';

interface NotifItem {
  id: string;
  title: string;
  description: string;
  unread: boolean;
}

function BellIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/**
 * Bell + unread badge that opens an accessible popover of "novos matches"
 * derived from saved alerts (localStorage `landmap_alerts`) and favorites
 * (`landmap_favorites`). Reads localStorage defensively; no external API.
 */
export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const rawAlerts = localStorage.getItem('landmap_alerts');
      const rawFavs = localStorage.getItem('landmap_favorites');
      const alerts = rawAlerts ? (JSON.parse(rawAlerts) as Array<{ id?: string; label?: string; city?: string }>) : [];
      const favs = rawFavs ? (JSON.parse(rawFavs) as unknown[]) : [];

      const list: NotifItem[] = [];
      alerts.forEach((a, i) => {
        list.push({
          id: `alert-${a.id ?? i}`,
          title: `Alerta: ${a.label ?? 'sem rótulo'}`,
          description: a.city ? `Cidade: ${a.city}` : 'Match de filtro salvo',
          unread: true,
        });
      });
      favs.forEach((f, i) => {
        const id = typeof f === 'string' ? f : (f as { id?: string })?.id;
        list.push({ id: `fav-${id ?? i}`, title: 'Favorito salvo', description: `Imóvel ${id ?? ''}`, unread: true });
      });

      setItems(list);
      setUnread(list.length);
    } catch {
      setItems([]);
      setUnread(0);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    function onPointer(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      close();
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openPanel() {
    setOpen(true);
    setUnread(0);
    requestAnimationFrame(() => panelRef.current?.focus());
  }
  function close() {
    setOpen(false);
    btnRef.current?.focus();
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? close() : openPanel())}
        aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] transition hover:border-[var(--border)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:shadow-[var(--ring)]"
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/70 px-1 text-[10px] font-semibold text-[var(--background)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        <span className="sr-only">{unread} notificações</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Notificações"
            tabIndex={-1}
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md focus-visible:outline-none"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">Novos matches</p>
              <span className="text-[11px] text-[var(--muted-foreground)]">{items.length}</span>
            </div>
            {items.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-[var(--muted-foreground)]">
                Nenhum alerta ainda. Salve imóveis e filtros para receber matches.
              </p>
            ) : (
              <ul className="max-h-72 space-y-1 overflow-auto">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="flex items-start gap-2 rounded-lg border border-[var(--border)] px-3 py-2"
                  >
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        it.unread ? 'bg-[var(--primary)]' : 'bg-[var(--border)]',
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--foreground)]">{it.title}</p>
                      <p className="truncate text-[11px] text-[var(--muted-foreground)]">{it.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

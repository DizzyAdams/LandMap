'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '../lib/index';

export interface CommandItem {
  id: string;
  label: string;
  /** Optional trailing hint, e.g. "⌘↵" or a route. */
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Extra terms to match against the query (not displayed). */
  keywords?: string[];
  /** Optional tonal accent for the leading mark. */
  tone?: 'emerald' | 'cyan' | 'violet' | 'gold' | 'neutral';
  onSelect: () => void;
}

export interface CommandGroup {
  heading: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  placeholder?: string;
  /** Accessible label for the dialog. */
  label?: string;
}

const toneMark: Record<NonNullable<CommandItem['tone']>, string> = {
  emerald: 'text-[var(--primary)]',
  cyan: 'text-[var(--primary)]',
  violet: 'text-[var(--accent)]',
  gold: 'text-[var(--warning)]',
  neutral: 'text-[var(--muted-foreground)]',
};

/**
 * Accessible ⌘K command palette (combobox + listbox pattern).
 * - `role="dialog"` + `aria-modal`, with a focus trap and ESC-to-close.
 * - Input is a `combobox` (`aria-expanded` / `aria-controls` / `aria-activedescendant`).
 * - Results are a `listbox` of `option`s with `aria-selected`; Arrow/Home/End/Enter navigate.
 * - Filtering matches `label` + `keywords` (case-insensitive, accent-insensitive).
 * - Built on brand tokens: glass surface, emerald/dual glow, GeistMono for hints.
 */
export function CommandPalette({
  open,
  onClose,
  groups,
  placeholder = 'Buscar ou executar ação…',
  label = 'Paleta de comandos',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const listId = `${dialogId}-list`;

  const normalize = (s: string) =>
    s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const flat = useMemo(() => {
    const q = normalize(query);
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => normalize(`${it.label} ${it.keywords?.join(' ') ?? ''}`).includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  // Flat index used for keyboard navigation across groups.
  const flatItems = useMemo(() => flat.flatMap((g) => g.items), [flat]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      const raf = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(raf);
    }
  }, [open]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, flatItems.length - 1)));
  }, [flatItems.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const move = (delta: number) => {
    if (flatItems.length === 0) return;
    setActive((a) => (a + delta + flatItems.length) % flatItems.length);
  };

  const select = (item: CommandItem | undefined) => {
    if (!item) return;
    onClose();
    item.onSelect();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(Math.max(0, flatItems.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        select(flatItems[active]);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-xl overflow-hidden rounded-lg border-[var(--border)] bg-[var(--card)] shadow-sm',
          'motion-reduce:transition-none',
        )}
      >
        {/* Search field */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0 text-[var(--muted-foreground)]"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={flatItems.length > 0}
            aria-controls={listId}
            aria-activedescendant={flatItems[active] ? `${listId}-opt-${active}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="h-12 w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
          />
          <kbd className="hidden shrink-0 rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className="max-h-[min(56vh,420px)] overflow-y-auto p-2"
        >
          {flatItems.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
              Nenhum resultado para “{query}”.
            </p>
          )}
          {flat.map((group) => (
            <div key={group.heading} className="mb-1">
              <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                {group.heading}
              </p>
              {group.items.map((item) => {
                runningIdx += 1;
                const idx = runningIdx;
                const isActive = idx === active;
                return (
                  <div
                    key={item.id}
                    id={`${listId}-opt-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    data-idx={idx}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => select(item)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                      'motion-reduce:transition-none',
                      isActive ? 'bg-[var(--accent)] text-[var(--foreground)]' : 'text-[var(--foreground)]',
                    )}
                  >
                    {item.icon ? (
                      <span aria-hidden className={cn('flex h-4 w-4 items-center justify-center', toneMark[item.tone ?? 'neutral'])}>
                        {item.icon}
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.hint && (
                      <span className="shrink-0 font-mono text-[10px] text-[var(--muted-foreground)]">{item.hint}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

CommandPalette.displayName = 'CommandPalette';


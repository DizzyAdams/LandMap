'use client';

import React, { forwardRef, useRef, useState } from 'react';
import { cn } from '../lib/index';

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  className?: string;
  children: (activeId: string) => React.ReactNode;
  defaultId?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, className, children, defaultId }, ref) => {
    const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
    const current = active ?? tabs[0]?.id;
    const refs = useRef<(HTMLButtonElement | null)[]>([]);

    const focusAndSelect = (index: number) => {
      const next = (index + tabs.length) % tabs.length;
      setActive(tabs[next].id);
      refs.current[next]?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
      const idx = tabs.findIndex((t) => t.id === current);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusAndSelect(idx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusAndSelect(idx - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusAndSelect(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusAndSelect(tabs.length - 1);
      }
    };

    return (
      <div ref={ref} className={className}>
        <div
          role="tablist"
          onKeyDown={onKeyDown}
          className="flex gap-1 overflow-x-auto border-b border-white/10"
        >
          {tabs.map((t, i) => {
            const selected = current === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls={`panel-${t.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(t.id)}
                className={cn(
                  'whitespace-nowrap rounded-t px-3 py-2 text-sm outline-none transition',
                  'border-b-2 -mb-px focus-visible:ring-2 focus-visible:ring-emerald-400/60',
                  'motion-reduce:transition-none',
                  selected
                    ? 'border-emerald-400 text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div
          id={`panel-${current}`}
          role="tabpanel"
          aria-labelledby={`tab-${current}`}
          tabIndex={0}
          className="pt-5 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded"
        >
          {children(current)}
        </div>
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';

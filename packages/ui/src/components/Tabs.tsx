'use client';

import React, { useState } from 'react';
import { cn } from '../lib/index';

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  className?: string;
  children: (activeId: string) => React.ReactNode;
}

/** Minimal underline tabs. */
export function Tabs({ tabs, className, children }: TabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = active ?? tabs[0]?.id;
  return (
    <div className={className}>
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={cn(
              'px-3 py-2 text-sm transition border-b-2 -mb-px',
              current === t.id
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="pt-5">{children(current)}</div>
    </div>
  );
}

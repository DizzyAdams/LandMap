'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@landmap/ui';

/**
 * Card with an internal radial spotlight that follows the pointer —
 * a premium, tactile micro-interaction used across featured properties & stats.
 */
export function SpotlightCard({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card)]',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--primary) 5%, transparent), transparent 50%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

'use client';

import { useRef, type ReactNode } from 'react';

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
      className={`spotlight-card group relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/40 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.35)] ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(52,211,153,0.20), rgba(34,211,238,0.10) 42%, transparent 66%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

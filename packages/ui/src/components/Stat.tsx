import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: number;
  className?: string;
}

/** Compact KPI card (Vercel/Linear-style). */
export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, hint, trend, className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-5 transition',
        'hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:shadow-[var(--elevation-2)]',
        'motion-reduce:transition-none',
        className,
      )}
    >
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">{value}</p>
      {trend !== undefined && (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs font-medium',
            trend >= 0 ? 'text-[var(--emerald)]' : 'text-[var(--danger)]',
          )}
        >
          <span aria-hidden>{trend >= 0 ? '+' : '-'}</span>
          {Math.abs(trend)}%
        </p>
      )}
      {hint && <p className="mt-1 text-[11px] text-[var(--text-muted)]">{hint}</p>}
    </div>
  ),
);

Stat.displayName = 'Stat';

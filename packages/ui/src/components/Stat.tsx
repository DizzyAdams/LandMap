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
        'rounded-lg border border-[var(--border)] bg-[var(--accent)] p-5 transition',
        'hover:border-[var(--border)] hover:bg-[var(--card)] hover:shadow-sm',
        'motion-reduce:transition-none',
        className,
      )}
    >
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">{value}</p>
      {trend !== undefined && (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs font-medium',
            trend >= 0 ? 'text-[var(--primary)]' : 'text-[var(--destructive)]',
          )}
        >
          <span aria-hidden>{trend >= 0 ? '+' : '-'}</span>
          {Math.abs(trend)}%
        </p>
      )}
      {hint && <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  ),
);

Stat.displayName = 'Stat';

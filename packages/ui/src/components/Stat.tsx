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
        'rounded-xl border border-white/10 bg-white/[0.04] p-5 transition',
        'hover:border-white/20 hover:bg-white/[0.06]',
        'motion-reduce:transition-none',
        className,
      )}
    >
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-neutral-50">{value}</p>
      {trend !== undefined && (
        <p
          className={cn(
            'mt-1 inline-flex items-center gap-1 text-xs font-medium',
            trend >= 0 ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          <span aria-hidden>{trend >= 0 ? '+' : '-'}</span>
          {Math.abs(trend)}%
        </p>
      )}
      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
    </div>
  ),
);

Stat.displayName = 'Stat';

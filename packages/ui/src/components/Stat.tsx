import React from 'react';
import { cn } from '../lib/index';

export interface StatProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: number;
  className?: string;
}

/** Compact KPI card (Vercel/Linear-style). */
export function Stat({ label, value, hint, trend, className }: StatProps) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-white/[0.04] p-5', className)}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {trend !== undefined && (
        <p className={cn('mt-1 text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </p>
      )}
      {hint && <p className="mt-1 text-[11px] text-neutral-600">{hint}</p>}
    </div>
  );
}

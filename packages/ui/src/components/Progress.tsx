import React from 'react';
import { cn } from '../lib/index';

export interface ProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
}

/** Thin progress bar with an emerald gradient fill. */
export function Progress({ value, className, barClassName }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500 motion-reduce:transition-none',
          barClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

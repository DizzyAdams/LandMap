import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export interface StatPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: React.ReactNode;
  value: React.ReactNode;
  trend?: number;
  tone?: 'emerald' | 'cyan' | 'violet' | 'gold' | 'neutral';
  icon?: React.ReactNode;
}

const tones: Record<NonNullable<StatPillProps['tone']>, string> = {
  emerald: 'border-[color-mix(in_srgb,var(--primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]',
  cyan: 'border-[color-mix(in_srgb,var(--primary)_10%,transparent)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]',
  violet: 'border-[color-mix(in_srgb,var(--accent)_10%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]',
  gold: 'border-[color-mix(in_srgb,var(--warning)_10%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] text-[var(--warning)]',
  neutral: 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]',
};

/** Compact, highlighted metric pill that reuses the brand accent tokens. */
export const StatPill = forwardRef<HTMLSpanElement, StatPillProps>(
  ({ label, value, trend, tone = 'emerald', icon, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur',
        'motion-reduce:transition-none',
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center">
          {icon}
        </span>
      ) : null}
      {label ? <span className="text-[var(--muted-foreground)]">{label}</span> : null}
      <span className="font-semibold tabular-nums text-[var(--foreground)]">{value}</span>
      {trend !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 tabular-nums',
            trend >= 0 ? 'text-[var(--primary)]' : 'text-[var(--destructive)]',
          )}
        >
          <span aria-hidden>{trend >= 0 ? '▲' : '▼'}</span>
          {Math.abs(trend)}%
        </span>
      )}
    </span>
  ),
);

StatPill.displayName = 'StatPill';

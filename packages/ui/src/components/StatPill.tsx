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
  emerald: 'border-[var(--emerald-tint)] bg-[var(--emerald-tint)] text-[var(--emerald-bright)]',
  cyan: 'border-[var(--cyan-tint)] bg-[var(--cyan-tint)] text-[var(--cyan)]',
  violet: 'border-[var(--violet-tint)] bg-[var(--violet-tint)] text-[var(--violet)]',
  gold: 'border-[var(--gold-tint)] bg-[var(--gold-tint)] text-[var(--gold-soft)]',
  neutral: 'border-[var(--border)] bg-[var(--surface-3)] text-[var(--accent-dim)]',
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
      {label ? <span className="text-[var(--muted)]">{label}</span> : null}
      <span className="font-semibold tabular-nums text-[var(--text-strong)]">{value}</span>
      {trend !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 tabular-nums',
            trend >= 0 ? 'text-[var(--emerald-bright)]' : 'text-[var(--danger)]',
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

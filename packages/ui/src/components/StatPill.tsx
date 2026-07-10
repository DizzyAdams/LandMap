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
  emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
  gold: 'border-[#d4af37]/40 bg-[#d4af37]/10 text-[var(--gold-soft)]',
  neutral: 'border-white/10 bg-white/5 text-neutral-200',
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
      {label ? <span className="text-neutral-400">{label}</span> : null}
      <span className="font-semibold tabular-nums text-neutral-50">{value}</span>
      {trend !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 tabular-nums',
            trend >= 0 ? 'text-emerald-300' : 'text-red-300',
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

import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[var(--surface-3)] text-[var(--accent-dim)] border-[var(--border)]',
  success: 'bg-[var(--emerald-tint)] text-[var(--emerald-bright)] border-[var(--emerald-tint)]',
  warning: 'bg-[var(--gold-tint)] text-[var(--gold-soft)] border-[var(--gold-tint)]',
  danger: 'bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)]',
  info: 'bg-[var(--cyan-tint)] text-[var(--cyan)] border-[var(--cyan-tint)]',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  ),
);

Badge.displayName = 'Badge';

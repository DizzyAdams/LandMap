import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-white/10 text-neutral-200 border-white/10',
  success: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  warning: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  danger: 'bg-red-400/10 text-red-300 border-red-400/30',
  info: 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30',
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

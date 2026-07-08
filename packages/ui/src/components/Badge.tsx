import React from 'react';
import { cn } from '../lib/index';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

export type { BadgeProps };

export const Badge = ({ variant = 'default', className, children, ...props }: BadgeProps) => {
  const styles = {
    default: 'bg-white/10 text-neutral-200 border border-white/10',
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-800/50',
    danger: 'bg-red-950/60 text-red-300 border border-red-800/50',
    info: 'bg-sky-950/60 text-sky-300 border border-sky-800/50',
  }[variant];

  return (
    <span className={cn('inline-block rounded-full px-3 py-0.5 text-xs font-medium', styles, className)} {...props}>
      {children}
    </span>
  );
};

import React from 'react';
import { cn } from '../lib/index';

// Lovable shadcn-style Badge — aligned to design-cto-lovable.md
export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
};

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-[var(--primary)]/10 text-[var(--primary)] border-transparent',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
  destructive: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  success: 'bg-[var(--success)]/10 text-[var(--success)] border-transparent',
  warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border-transparent',
  info: 'bg-[var(--primary)]/10 text-[var(--primary)] border-transparent',
  outline: 'text-[var(--foreground)] border-[var(--border)]',
};

export const Badge = ({ variant = 'default', className, children, ...props }: BadgeProps) => (
  <div
    className={cn(
      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2',
      variants[variant],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

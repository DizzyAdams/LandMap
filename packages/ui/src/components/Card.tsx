import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

// Lovable shadcn-style Card — aligned to design-cto-lovable.md
// https://landmap-insight.lovable.app (referencia maxima do CTO)

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'interactive' | 'highlight';
};

const variants: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-[var(--card)] border-[var(--border)]',
  interactive:
    'bg-[var(--card)] border-[var(--border)] cursor-pointer transition-all hover:border-[var(--ring)] hover:bg-[var(--accent)] hover:-translate-y-px active:scale-[0.995]',
  highlight:
    'border-[var(--ring)] bg-[var(--accent)] shadow-sm',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border p-5 shadow-sm outline-none transition',
        'focus-visible:ring-1 focus-visible:ring-[var(--ring)]',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';

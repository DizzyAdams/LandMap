import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'interactive' | 'highlight';
};

const variants: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-[var(--surface-2)] border-[var(--border)]',
  interactive:
    'bg-[var(--surface-2)] border-[var(--border)] cursor-pointer transition-[transform,border-color,background-color,box-shadow] hover:border-[var(--border-strong)] hover:bg-[var(--surface-3)] hover:-translate-y-px active:scale-[0.995]',
  highlight:
    'border-[var(--border-strong)] bg-[var(--surface-3)] shadow-[inset_0_0_0_1px_var(--border-subtle)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[var(--radius-md)] p-5 outline-none transition',
        'focus-visible:shadow-[var(--ring)]',
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

import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'interactive' | 'highlight';
};

const variants: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white/5 border-white/10',
  interactive:
    'bg-white/5 border-white/10 cursor-pointer transition-[transform,border-color,background-color,box-shadow] hover:border-white/20 hover:bg-white/[0.07] hover:-translate-y-px active:scale-[0.995]',
  highlight:
    'border-white/20 bg-white/[0.08] shadow-[0_0_0_1px_inset_rgba(255,255,255,0.1)]',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl p-5 outline-none transition',
        'focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
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

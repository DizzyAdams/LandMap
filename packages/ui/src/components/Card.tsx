import React from 'react';
import { cn } from '../lib/index';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'interactive' | 'highlight';
};

export type { CardProps };

export const Card = ({ variant = 'default', className, children, ...props }: CardProps) => {
  const styles = {
    default: 'bg-white/5 border border-white/10',
    interactive:
      'bg-white/5 border border-white/10 cursor-pointer transition hover:border-white/20 hover:bg-white/[0.07]',
    highlight:
      'border border-white/20 bg-white/[0.08] shadow-[0_0_0_1px_inset_rgba(255,255,255,0.1)]',
  }[variant];

  return (
    <div className={cn('rounded-xl p-5', styles, className)} {...props}>
      {children}
    </div>
  );
};

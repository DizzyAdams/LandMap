import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      {children}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

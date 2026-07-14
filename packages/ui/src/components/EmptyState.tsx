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
        'rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-10 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {description && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>}
      {children}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

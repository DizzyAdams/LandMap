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
        'rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface-inset)] p-10 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-[var(--text)]">{title}</p>
      {description && <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>}
      {children}
    </div>
  ),
);

EmptyState.displayName = 'EmptyState';

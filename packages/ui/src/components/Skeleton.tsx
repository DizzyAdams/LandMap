import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

const variants: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 w-full rounded',
  rect: 'h-24 w-full rounded-lg',
  circle: 'h-12 w-12 rounded-full',
};

/** Shimmer loading placeholder. The `.skeleton` shimmer is defined in CSS (globals.css). */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rect', className, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn('skeleton', variants[variant], className)}
      {...props}
    />
  ),
);

Skeleton.displayName = 'Skeleton';

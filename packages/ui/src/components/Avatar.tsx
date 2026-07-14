import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export interface AvatarProps {
  name: string;
  status?: 'idle' | 'running' | 'paused';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const toneMap = {
  running: 'bg-[color:color-mix(in_srgb,var(--primary)_20%,transparent)] text-[var(--primary)]',
  paused: 'bg-[color:color-mix(in_srgb,var(--warning)_20%,transparent)] text-[var(--warning)]',
  idle: 'bg-[var(--card)] text-[var(--foreground)]',
};

/** Initials avatar with a status tint. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, status = 'idle', size = 'md', className }, ref) => {
    const initials = name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <span
        ref={ref}
        role="img"
        aria-label={name}
        title={name}
        className={cn(
          'inline-flex select-none items-center justify-center rounded-full font-semibold',
          sizeMap[size],
          toneMap[status],
          className,
        )}
      >
        {initials}
      </span>
    );
  },
);

Avatar.displayName = 'Avatar';

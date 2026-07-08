import React from 'react';
import { cn } from '../lib/index';

export interface AvatarProps {
  name: string;
  status?: 'idle' | 'running' | 'paused';
  className?: string;
}

/** Initials avatar with a status tint. */
export function Avatar({ name, status = 'idle', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const tone =
    status === 'running'
      ? 'bg-emerald-500/20 text-emerald-300'
      : status === 'paused'
        ? 'bg-amber-500/20 text-amber-300'
        : 'bg-white/10 text-neutral-300';
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold',
        tone,
        className,
      )}
    >
      {initials}
    </span>
  );
}

'use client';

import React from 'react';
import { cn } from '../lib/index';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Segmented control (Linear-style) for mutually-exclusive choices. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-white/10 bg-white/5 p-1',
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition',
            value === o.value
              ? 'bg-white text-neutral-900'
              : 'text-neutral-400 hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

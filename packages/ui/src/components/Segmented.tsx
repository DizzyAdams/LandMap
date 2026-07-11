'use client';

import React, { forwardRef, useRef } from 'react';
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
  'aria-label'?: string;
}

function SegmentedInner<T extends string>(
  { options, value, onChange, className, 'aria-label': ariaLabel }: SegmentedProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (index: number) => {
    const next = (index + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const idx = options.findIndex((o) => o.value === value);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(idx - 1);
    }
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('inline-flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-1', className)}
    >
      {options.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium outline-none transition',
              'focus-visible:shadow-[var(--ring)]',
              'motion-reduce:transition-none',
              selected
                ? 'bg-[var(--emerald-tint)] text-[var(--emerald-bright)]'
                : 'text-[var(--muted)] hover:text-[var(--text-strong)]',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const Segmented = forwardRef(SegmentedInner as any) as <T extends string>(
  props: SegmentedProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement;

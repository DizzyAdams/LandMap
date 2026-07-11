import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, disabled, ...props }, ref) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${inputId ?? 'input'}-error` : undefined;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            'w-full rounded-[var(--radius-md)] border bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--muted-2)] outline-none transition',
            'focus:border-[var(--emerald)] focus:bg-[var(--surface-3)] focus-visible:shadow-[var(--ring)]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--surface-inset)]',
            'motion-reduce:transition-none',
            error ? 'border-[color:color-mix(in_srgb,var(--danger)_60%,transparent)]' : 'border-[var(--border)]',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-[var(--danger)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

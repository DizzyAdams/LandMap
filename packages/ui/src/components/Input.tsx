import React, { forwardRef } from 'react';
import { cn } from '../lib/index';

// Lovable shadcn-style Input
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
          <label htmlFor={inputId} className="text-xs font-medium text-[var(--muted-foreground)]">
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
            'flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1 text-sm text-[var(--foreground)] shadow-sm transition-colors',
            'placeholder:text-[var(--muted-foreground)]',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-[var(--destructive)]' : '',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-[var(--destructive)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

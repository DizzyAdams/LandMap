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
          <label htmlFor={inputId} className="text-xs font-medium text-neutral-400">
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
            'w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 outline-none transition',
            'focus:border-emerald-400/60 focus:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-emerald-400/60',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/[0.02]',
            'motion-reduce:transition-none',
            error ? 'border-red-500/60' : 'border-white/10',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

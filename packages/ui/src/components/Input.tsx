import React from 'react';
import { cn } from '../lib/index';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export type { InputProps };

export const Input = ({ label, error, className, id, ...props }: InputProps) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-neutral-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-lg border bg-white/5 px-3 py-2 text-sm text-neutral-50 placeholder-neutral-500 outline-none transition',
          'focus:border-white/30 focus:bg-white/[0.07]',
          error ? 'border-red-500/60' : 'border-white/10',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

import React from 'react';
import { cn } from '../lib/index';

// `primary` is the Lovable indigo action.
// `hero` keeps an explicit, opt-in high-contrast white for rare cases (never the default).
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'hero';
  size?: 'sm' | 'md' | 'lg';
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
};

export const Button = ({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) => {
  const styles = {
    // Lovable indigo primary action
    primary:
      'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] hover:bg-[var(--primary-glow)]',
    // Rarely-used high-contrast hero (explicit opt-in, not the default)
    hero: 'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--secondary)]',
    ghost: 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
    outline: 'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--ring)] hover:bg-[var(--muted)]',
  }[variant];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-[transform,box-shadow,background-color,opacity] duration-300',
        'outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        'disabled:opacity-50 disabled:pointer-events-none',
        'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        sizes[size],
        styles,
        className,
      )}
      {...props}
    />
  );
};

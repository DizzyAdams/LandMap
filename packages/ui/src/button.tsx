import React from 'react';
import { cn } from './cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'hero';
  size?: 'sm' | 'md' | 'lg';
};

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: 'var(--radius-md)',
  fontWeight: 500,
  gap: 8,
  transition:
    'background-color 0.15s ease, background 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease, box-shadow 0.2s ease, transform 0.15s ease',
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  opacity: 1,
};

const focusBase: React.CSSProperties = {
  outline: 'none',
  boxShadow: 'var(--ring)',
};

const disabledBase: React.CSSProperties = {
  opacity: 0.5,
  pointerEvents: 'none',
};

const variantMap: Record<
  'default' | 'outline' | 'ghost' | 'hero',
  { base: React.CSSProperties; hover: React.CSSProperties }
> = {
  default: {
    base: {
      background: 'var(--primary)',
      color: 'var(--primary-foreground)',
      boxShadow: 'var(--shadow-card)',
    },
    hover: {
      background: 'var(--primary-glow)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow-glow)',
    },
  },
  outline: {
    base: { backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' },
    hover: { backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' },
  },
  ghost: {
    base: { backgroundColor: 'transparent', color: 'var(--muted-foreground)' },
    hover: { backgroundColor: 'var(--muted)', color: 'var(--foreground)' },
  },
  // Explicit, rarely-used high-contrast white. Never the default.
  hero: {
    base: { backgroundColor: 'var(--foreground)', color: 'var(--background)' },
    hover: { backgroundColor: 'var(--secondary)' },
  },
};

const sizeMap: Record<'sm' | 'md' | 'lg', React.CSSProperties> = {
  sm: { height: 36, padding: '0 12px', fontSize: 14 },
  md: { height: 40, padding: '0 16px', fontSize: 14 },
  lg: { height: 44, padding: '0 20px', fontSize: 16 },
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  type = 'button',
  disabled,
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const rootStyle: React.CSSProperties = {
    ...base,
    ...(disabled ? disabledBase : {}),
    ...variantMap[variant].base,
    ...(hovered && !disabled ? variantMap[variant].hover : {}),
    ...(focused ? focusBase : {}),
    ...sizeMap[size],
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(className)}
      style={rootStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        // Only show the focus ring for keyboard focus, not pointer focus.
        if (e.currentTarget.matches(':focus-visible')) setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

/**
 * Class-based variant helper (shadcn pattern) so non-button elements — e.g.
 * `<Link className={cn(buttonVariants({ variant: 'default' }), 'h-12 px-6')}>` —
 * can share the Button's exact visual treatment. Mirrors the inline-style
 * `variantMap`/`sizeMap` above 1:1 and consumes the same design tokens.
 */
export function buttonVariants({
  variant = 'default',
  size = 'md',
  className,
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
} = {}) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium outline-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 rounded-md px-3 text-xs',
    md: 'h-9 px-4 py-2',
    lg: 'h-10 rounded-md px-8',
  };
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    default:
      'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] hover:bg-[var(--primary-glow)]',
    outline:
      'bg-transparent border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
    ghost:
      'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
    hero: 'bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--secondary)]',
  };
  return cn(base, sizes[size], variants[variant], className);
}

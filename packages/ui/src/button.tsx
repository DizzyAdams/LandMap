import React from 'react';
import { cn } from './cn';

// `default` is the bioluminescent primary action; `hero` keeps an explicit,
// opt-in high-contrast white only for rare cases (never the default).
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'hero' | 'gold';
  size?: 'sm' | 'md' | 'lg';
};

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: 'var(--radius-md)',
  fontWeight: 500,
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

// Bioluminescent emerald->cyan primary; neutral ghost/outline stay on-brand.
const variantMap: Record<
  'default' | 'outline' | 'ghost' | 'hero' | 'gold',
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
    base: { backgroundColor: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text)' },
    hover: { backgroundColor: 'var(--surface-2)', borderColor: 'var(--muted-2)', color: 'var(--text-strong)' },
  },
  ghost: {
    base: { backgroundColor: 'transparent', color: 'var(--muted)' },
    hover: { backgroundColor: 'var(--surface-2)', color: 'var(--text-strong)' },
  },
  // Explicit, rarely-used high-contrast white. Never the default.
  hero: {
    base: { backgroundColor: 'var(--text-strong)', color: 'var(--bg)' },
    hover: { backgroundColor: 'var(--accent-dim)' },
  },
  // Sovereign champagne gold — premium investor / capital accent (on tokens).
  gold: {
    base: {
      background: 'linear-gradient(90deg, var(--gold-soft) 0%, var(--gold) 55%, var(--gold-deep) 100%)',
      color: '#050505',
      boxShadow: 'var(--glow-gold)',
    },
    hover: {
      background: 'linear-gradient(90deg, var(--gold-bright) 0%, var(--gold) 55%, var(--gold-deep) 100%)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--glow-sovereign)',
    },
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
    'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] font-medium outline-none transition-[background-color,border-color,color,box-shadow,transform,opacity] focus-visible:shadow-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none';
  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    default:
      'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[var(--shadow-card)] hover:bg-[var(--primary-glow)] hover:-translate-y-px hover:shadow-[var(--shadow-glow)]',
    outline:
      'bg-transparent border border-[var(--border-strong)] text-[var(--text)] hover:bg-[var(--surface-2)] hover:border-[var(--muted-2)] hover:text-[var(--text-strong)]',
    ghost:
      'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]',
    hero: 'bg-[var(--text-strong)] text-[var(--bg)] hover:bg-[var(--accent-dim)]',
    gold:
      'bg-[linear-gradient(90deg,var(--gold-soft),var(--gold)_55%,var(--gold-deep))] text-[var(--bg)] shadow-[var(--glow-gold)] hover:bg-[linear-gradient(90deg,var(--gold-bright),var(--gold)_55%,var(--gold-deep))] hover:-translate-y-px hover:shadow-[var(--glow-sovereign)]',
  };
  return cn(base, sizes[size], variants[variant], className);
}

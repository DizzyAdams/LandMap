import React from 'react';
import { cn } from './cn';

// `default` is the bioluminescent primary action; `hero` keeps an explicit,
// opt-in high-contrast white only for rare cases (never the default).
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'hero';
  size?: 'sm' | 'md' | 'lg';
};

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: 6,
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
  boxShadow: '0 0 0 1px var(--emerald), 0 0 0 3px rgba(52,211,153,0.25)',
};

const disabledBase: React.CSSProperties = {
  opacity: 0.5,
  pointerEvents: 'none',
};

// Bioluminescent emerald->cyan primary; neutral ghost/outline stay on-brand.
const variantMap: Record<
  'default' | 'outline' | 'ghost' | 'hero',
  { base: React.CSSProperties; hover: React.CSSProperties }
> = {
  default: {
    base: {
      background: 'linear-gradient(90deg, var(--emerald) 0%, var(--cyan) 100%)',
      color: 'var(--bg)',
      boxShadow: 'var(--glow-emerald)',
    },
    hover: {
      background: 'linear-gradient(90deg, var(--emerald-bright) 0%, var(--cyan) 100%)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--glow-dual)',
    },
  },
  outline: {
    base: { backgroundColor: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text)' },
    hover: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#737373', color: '#ffffff' },
  },
  ghost: {
    base: { backgroundColor: 'transparent', color: 'var(--muted)' },
    hover: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#ffffff' },
  },
  // Explicit, rarely-used high-contrast white. Never the default.
  hero: {
    base: { backgroundColor: '#ffffff', color: '#050505' },
    hover: { backgroundColor: '#e5e5e5' },
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
        setFocused(true);
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

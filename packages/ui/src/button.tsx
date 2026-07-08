import React from 'react';
import { cn } from './cn';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  borderRadius: 6,
  fontWeight: 500,
  transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease',
  outline: 'none',
  border: 'none',
  cursor: 'pointer',
  opacity: 1,
};

const focusBase: React.CSSProperties = {
  outline: 'none',
  boxShadow: '0 0 0 1px #fff, 0 0 0 3px rgba(255,255,255,0.18)',
};

const variantMap: Record<'default' | 'outline' | 'ghost', React.CSSProperties> = {
  default: { backgroundColor: '#fff', color: '#000' },
  outline: { backgroundColor: 'transparent', border: '1px solid #525252', color: '#e5e5e5' },
  ghost: { backgroundColor: 'transparent', color: '#d4d4d4' },
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
  onFocus,
  onBlur,
  ...props
}: ButtonProps) {
  const [focused, setFocused] = React.useState(false);

  const rootStyle: React.CSSProperties = {
    ...base,
    ...(focused ? focusBase : {}),
    ...variantMap[variant],
    ...sizeMap[size],
    ...(props.disabled ? { opacity: 0.5, pointerEvents: 'none' as any } : {}),
  };

  return (
    <button
      type={type}
      className={cn(className)}
      style={rootStyle}
      onMouseEnter={(e) => {
        if (variant === 'default') {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e5e5e5';
        } else {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = variant === 'default' ? '#fff' : 'transparent';
      }}
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

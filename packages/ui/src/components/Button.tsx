import React from 'react';
import { cn } from '../lib/index';

// `primary` is the bioluminescent emerald->cyan action (was white).
// `hero` keeps an explicit, opt-in high-contrast white for rare cases (never the default).
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'hero';
};

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const styles = {
    // Bioluminescent primary action: emerald->cyan gradient, near-black text, dual-glow lift on hover
    primary:
      'bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050505] shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_8px_30px_-12px_rgba(34,211,238,0.5)] hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_14px_44px_-12px_rgba(34,211,238,0.65)]',
    // Rarely-used high-contrast hero (explicit opt-in, not the default)
    hero: 'bg-white text-[#050505] hover:opacity-80',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    outline: 'border border-white/20 bg-transparent text-neutral-200 hover:border-neutral-500 hover:bg-white/10 hover:text-white',
  }[variant];

  return (
    <button
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none',
        styles,
        className,
      )}
      {...props}
    />
  );
};

import React from 'react';
import { cn } from '../lib/index';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline';
};

export const Button = ({ variant = 'primary', className, ...props }: ButtonProps) => {
  const styles = {
    primary: 'bg-white text-black hover:opacity-80',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    outline: 'border border-white/20 bg-transparent hover:bg-white/10',
  }[variant];

  return <button className={cn('rounded-lg px-4 py-2 text-sm font-semibold transition', styles, className)} {...props} />;
};

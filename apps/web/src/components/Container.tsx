import { cn } from '@landmap/ui';
import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}

/** Centered max-width wrapper (Sovereign Intelligence layout system). */
export function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div className={cn(narrow ? 'container-narrow' : 'container-x', className)}>
      {children}
    </div>
  );
}

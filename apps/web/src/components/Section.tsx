import { cn } from '@landmap/ui';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Vertical-rhythm section wrapper. */
export function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn('section', className)}>
      {children}
    </section>
  );
}

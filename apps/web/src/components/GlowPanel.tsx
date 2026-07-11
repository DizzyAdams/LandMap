import { cn } from '@landmap/ui/server';
import type { ReactNode } from 'react';

interface GlowPanelProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'aside';
}

/**
 * GlowPanel — the shared "Surreal Intelligence" surface.
 *
 * A glass panel (`.terminal`) wrapped in an animated sovereign rim
 * (`.gradient-border`). Drop any page content inside to give it the premium,
 * on-brand frame used across LandMap 3.0. Server component (no client JS).
 */
export function GlowPanel({ children, className, as: Tag = 'div' }: GlowPanelProps) {
  return (
    <Tag className={cn('gradient-border terminal relative', className)}>
      <div className="relative z-[1]">{children}</div>
    </Tag>
  );
}

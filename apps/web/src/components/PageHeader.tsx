import { cn } from '@landmap/ui';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Repeatable page header: eyebrow + title + description + actions slot.
 * The consistent masthead for every LandMap surface.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('page-header', className)}>
      {eyebrow ? (
        <div className="flex items-center gap-3">
          <span className="kicker">{eyebrow}</span>
        </div>
      ) : null}
      <h1 className="m-0 text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="text-caption max-w-2xl text-base !text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

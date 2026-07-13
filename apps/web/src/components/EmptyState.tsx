import type { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex min-h-[30vh] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-12">
      <div className="max-w-sm text-center">
        {icon && (
          <span aria-hidden className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--primary)]">
            {icon}
          </span>
        )}
        <h3 className="text-base font-medium text-[var(--foreground)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/60 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

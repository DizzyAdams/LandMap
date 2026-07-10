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
    <div role="status" className="flex min-h-[30vh] items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/20 px-6 py-12">
      <div className="max-w-sm text-center">
        {icon && (
          <span aria-hidden className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/40 text-emerald-300">
            {icon}
          </span>
        )}
        <h3 className="text-base font-medium text-neutral-50">{title}</h3>
        <p className="mt-2 text-sm text-neutral-400">{description}</p>
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-5 py-2 text-xs font-medium text-neutral-300 transition hover:border-emerald-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-5 inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 px-5 py-2 text-xs font-medium text-neutral-300 transition hover:border-emerald-400/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  );
}

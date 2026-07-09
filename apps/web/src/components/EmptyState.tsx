import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex min-h-[30vh] items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/20 px-6 py-12">
      <div className="max-w-sm text-center">
        {icon && (
          <span aria-hidden className="mb-3 block text-3xl">{icon}</span>
        )}
        <h3 className="text-base font-medium text-neutral-50">{title}</h3>
        <p className="mt-2 text-sm text-neutral-400">{description}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 rounded-lg border border-neutral-700 bg-neutral-900 px-5 py-2 text-xs font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

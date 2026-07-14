import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/index';

// Lovable shadcn-style Toast
export type ToastVariant = 'default' | 'success' | 'error' | 'info';

export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends Omit<ToastOptions, 'variant' | 'duration'> {
  id: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const accent: Record<ToastVariant, string> = {
  default: 'border-[var(--border)]',
  success: 'border-[var(--success)]/30',
  error: 'border-[var(--destructive)]/30',
  info: 'border-[var(--primary)]/30',
};

const dotColor: Record<ToastVariant, string> = {
  default: 'bg-[var(--muted-foreground)]',
  success: 'bg-[var(--success)]',
  error: 'bg-[var(--destructive)]',
  info: 'bg-[var(--primary)]',
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    if (item.duration <= 0) return;
    const t = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 16, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-lg border bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-lg backdrop-blur-md',
        accent[item.variant],
      )}
    >
      <span
        aria-hidden
        className={cn('mt-1.5 h-2 w-2 flex-none rounded-full', dotColor[item.variant])}
      />
      <div className="min-w-0 flex-1">
        {item.title && <p className="font-semibold text-[var(--foreground)]">{item.title}</p>}
        {item.description && <p className="mt-0.5 text-[var(--muted-foreground)]">{item.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss"
        className="flex-none rounded-md p-1 text-[var(--muted-foreground)] outline-none transition hover:bg-[var(--accent)] hover:text-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children, max = 5 }: { children?: React.ReactNode; max?: number }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (opts: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      const item: ToastItem = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? 'default',
        duration: opts.duration ?? 4000,
      };
      setToasts((prev) => [...prev, item].slice(-max));
      return id;
    },
    [max],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>.');
  return ctx;
}

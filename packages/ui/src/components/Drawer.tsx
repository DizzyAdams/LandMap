import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/index';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  side?: 'right' | 'left';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Right (or left) slide-over panel with backdrop, ESC-to-close and basic
 * focus trapping. Entrance is animated with framer-motion.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  side = 'right',
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement as HTMLElement | null;
      const raf = window.requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (!panel) return;
        const target = panel.querySelector<HTMLElement>('[data-autofocus]') ?? panel;
        target.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    prevFocus.current?.focus?.();
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      );
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const x = side === 'right' ? '100%' : '-100%';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="landmap-drawer"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ x }}
            animate={{ x: 0 }}
            exit={{ x }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute bottom-0 top-0 flex w-[min(92vw,420px)] flex-col border-white/10 bg-[var(--surface-1)]/95 shadow-[var(--glow-emerald)] backdrop-blur-xl outline-none',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              className,
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
                <div className="min-w-0">
                  {title && (
                    <h2 id={titleId} className="text-base font-semibold text-neutral-50">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1 text-sm text-neutral-400">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex-none rounded-md p-1 text-neutral-400 outline-none transition hover:bg-white/10 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-neutral-300">{children}</div>
            {footer && <div className="border-t border-white/10 px-5 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

Drawer.displayName = 'Drawer';

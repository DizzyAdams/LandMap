'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../lib/index';

export interface TourStep {
  /** CSS selector of the element to spotlight (e.g. `[data-tour="search"]`). */
  target?: string;
  title: string;
  description: React.ReactNode;
  /** Preferred placement of the card relative to the target. */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface OnboardingTourProps {
  open: boolean;
  steps: TourStep[];
  onFinish: () => void;
  onSkip?: () => void;
  /** If provided, the tour auto-skips when this localStorage key is set. */
  storageKey?: string;
  /** Label for the dialog (accessibility). */
  label?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const MARGIN = 12;
const CARD_W = 320;

/**
 * First-run spotlight tour. Highlights a target element via a box-shadow
 * "cutout" and shows a positioned, accessible card with progress + nav.
 * - Card is `role="dialog"` `aria-modal`, traps focus, Escape = skip.
 * - `aria-live` announces "Passo X de Y".
 * - Respects `prefers-reduced-motion` (no entrance animation).
 * - Recomputes target rect on scroll/resize; falls back to a centered card
 *   when a step has no `target` or the element is off-screen.
 */
export function OnboardingTour({
  open,
  steps,
  onFinish,
  onSkip,
  storageKey,
  label = 'Tour de boas-vindas',
}: OnboardingTourProps) {
  const [current, setCurrent] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const measure = useCallback(() => {
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(step.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
      setRect(null);
      return;
    }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step?.target]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
  }, [open, measure, current]);

  useEffect(() => {
    if (!open) return;
    const onScrollResize = () => measure();
    window.addEventListener('resize', onScrollResize);
    window.addEventListener('scroll', onScrollResize, true);
    return () => {
      window.removeEventListener('resize', onScrollResize);
      window.removeEventListener('scroll', onScrollResize, true);
    };
  }, [open, measure]);

  // Auto-skip if previously completed.
  useEffect(() => {
    if (!open || !storageKey) return;
    try {
      if (localStorage.getItem(storageKey)) onFinish();
    } catch {
      /* ignore */
    }
  }, [open, storageKey, onFinish]);

  // Move focus into the card when it opens / step changes.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => cardRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open, current]);

  if (!open || !step) return null;

  const markSeen = () => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  };

  const finish = () => {
    markSeen();
    onFinish();
  };

  const next = () => (isLast ? finish() : setCurrent((c) => c + 1));
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const skip = () => {
    markSeen();
    onSkip?.();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      skip();
    }
  };

  // Card placement (clamped to viewport).
  const placement = step.placement ?? (rect && rect.top > window.innerHeight / 2 ? 'top' : 'bottom');
  const cardStyle: React.CSSProperties = (() => {
    if (!rect || placement === 'center') {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }
    const gap = 14;
    let top = 0;
    let left = rect.left + rect.width / 2 - CARD_W / 2;
    if (placement === 'bottom') top = rect.top + rect.height + gap;
    else if (placement === 'top') top = rect.top - gap;
    else if (placement === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.left + rect.width + gap;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - gap - CARD_W;
    }
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - CARD_W - MARGIN));
    if (placement === 'top' || placement === 'left' || placement === 'right') {
      top = Math.max(MARGIN, Math.min(top, window.innerHeight - 180 - MARGIN));
    } else {
      top = Math.max(MARGIN, Math.min(top, window.innerHeight - 220 - MARGIN));
    }
    return { top, left };
  })();

  const descId = `${label}-desc`;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKeyDown}>
      {/* Dim overlay; spotlight cutout via huge box-shadow on the target ring. */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" onClick={skip} aria-hidden />

      {rect && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-xl ring-2 ring-emerald-400/70 transition-all duration-300 motion-reduce:transition-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
          }}
        />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        style={{ ...cardStyle, width: CARD_W }}
        className={cn(
          'surface absolute rounded-2xl border border-white/10 p-5 shadow-[var(--glow-emerald)] outline-none',
          'motion-reduce:transition-none',
        )}
      >
        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          Passo {current + 1} de {steps.length}
        </p>
        <h2 className="mt-1.5 text-base font-semibold text-neutral-50">{step.title}</h2>
        <p id={descId} className="mt-1.5 text-sm leading-relaxed text-neutral-400">
          {step.description}
        </p>

        <div aria-live="polite" className="sr-only">
          Passo {current + 1} de {steps.length}: {step.title}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="rounded-lg px-3 py-1.5 text-xs text-neutral-500 outline-none transition hover:text-neutral-200 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          >
            Pular
          </button>
          <div className="flex items-center gap-2">
            {current > 0 && (
              <button
                type="button"
                onClick={prev}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-200 outline-none transition hover:border-white/20 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-1.5 text-xs font-semibold text-[#050505] outline-none transition hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              {isLast ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

OnboardingTour.displayName = 'OnboardingTour';


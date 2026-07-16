'use client';

import {
  useRef,
  useLayoutEffect,
  type ReactNode,
  type ElementType,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  y?: number;
};

/** Fade + rise entrance. Runs once on mount. */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
  y = 24,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration: 0.8,
        delay,
        ease: 'power3.out',
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, y]);

  const Comp = Tag as ElementType;
  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  y?: number;
};

/** Staggered reveal of direct children when scrolled into view. */
export function Stagger({
  children,
  className,
  selector = ':scope > *',
  stagger = 0.08,
  y = 20,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.querySelectorAll(selector), {
        opacity: 0,
        y,
        duration: 0.7,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [selector, stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Thin scroll-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (prefersReduced() || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transform: 'scaleX(0)', transformOrigin: 'left' }}
      aria-hidden
      className="fixed left-0 top-0 z-50 h-0.5 w-full bg-[var(--primary)]/80 shadow-[0_0_12px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
    />
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion, useMotionValue } from 'framer-motion';
import { cn } from '../lib/index';

export interface AnimatedNumberProps {
  value: number;
  /** Animation duration in ms. Default 1200. */
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Count-up number that animates the first time it scrolls into view.
 * Uses the mono tabular `.ledger-num` face. Respects prefers-reduced-motion
 * by rendering the final value immediately.
 */
export function AnimatedNumber({
  value,
  durationMs = 1200,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: durationMs / 1000,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, reduce, value, durationMs, mv]);

  const formatted = Number(display).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={cn('ledger-num', className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

'use client';

import { useEffect, useState } from 'react';

/**
 * CountUp — eases a number from 0 → `value` on mount for a premium,
 * "live dashboard" feel in the hero metrics. Respects prefers-reduced-motion
 * by snapping straight to the final value.
 */
export function CountUp({
  value,
  suffix = '',
  duration = 1400,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span>
      {n.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
}

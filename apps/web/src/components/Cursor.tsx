'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Signature out-of-the-ordinary cursor: a crisp emerald core plus a soft
 * bioluminescent aura that trails the pointer with spring easing.
 * Additive (native cursor stays) so it never hurts usability.
 * Hidden on touch devices and when reduced-motion is requested.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reduced) return;
    setEnabled(true);

    const dot = dotRef.current!;
    const aura = auraRef.current!;
    let raf = 0;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ax = mx;
    let ay = my;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest('a,button,[role="button"],input,select,textarea,.spotlight-card');
      aura.dataset.hover = interactive ? '1' : '0';
    };

    const loop = () => {
      ax += (mx - ax) * 0.18;
      ay += (my - ay) * 0.18;
      aura.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={auraRef}
        aria-hidden
        data-hover="0"
        className="cursor-aura pointer-events-none fixed left-0 top-0 z-[60] h-10 w-10 rounded-full blur-lg mix-blend-screen transition-[width,height] duration-200 data-[hover='1']:h-16 data-[hover='1']:w-16"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(52,211,153,0.55), rgba(34,211,238,0.30) 55%, transparent 72%)',
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[61] h-2 w-2 rounded-full bg-emerald-200 shadow-[0_0_16px_rgba(52,211,153,1)] ring-2 ring-cyan-300/40"
      />
    </>
  );
}

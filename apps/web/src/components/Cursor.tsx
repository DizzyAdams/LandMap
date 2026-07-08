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
        className="cursor-aura pointer-events-none fixed left-0 top-0 z-[60] h-8 w-8 rounded-full bg-emerald-400/30 blur-md transition-[width,height,background-color] duration-200 data-[hover='1']:h-14 data-[hover='1']:w-14 data-[hover='1']:bg-emerald-300/20"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[61] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
      />
    </>
  );
}

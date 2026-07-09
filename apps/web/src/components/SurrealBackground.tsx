'use client';

import { useEffect, useRef } from 'react';

/**
 * Surreal ambient background: a slow-drifting constellation of glowing nodes
 * connected by emerald filaments, with a soft breathing radial wash.
 * Respects prefers-reduced-motion and pauses when the tab is hidden.
 */
export function SurrealBackground({
  className,
}: {
  className?: string;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: Node[] = [];

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(28, Math.min(80, Math.floor((width * height) / 26000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.6,
      }));
    }

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Breathing radial wash
      const pulse = 0.06 + Math.sin(t / 2600) * 0.02;
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.1,
        0,
        width / 2,
        height * 0.1,
        Math.max(width, height),
      );
      grad.addColorStop(0, `rgba(52,211,153,${pulse})`);
      grad.addColorStop(1, 'rgba(5,5,5,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // Links
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18;
            ctx.strokeStyle = `rgba(52,211,153,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110,231,183,0.55)';
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    let raf = requestAnimationFrame(frame);
    resize();
    window.addEventListener('resize', resize);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={
        className ??
        'pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70'
      }
    />
  );
}

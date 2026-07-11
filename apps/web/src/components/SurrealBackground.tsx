'use client';

import { useEffect, useRef } from 'react';

/**
 * SurrealBackground - a living, bioluminescent field that breathes behind the
 * whole app. It layers three cheap, GPU-friendly passes on a single 2D canvas:
 *   1. a slow-drifting constellation of glowing nodes linked by emerald
 *      filaments (the living data motif),
 *   2. a few soft brand-colored light orbs that float and breathe,
 *   3. a gentle radial wash that pulses like distant city light.
 * Fully SSR-safe (client component), DPR-capped, paused when the tab is hidden
 * and frozen to a single static frame under prefers-reduced-motion.
 */
export function SurrealBackground({ className }: { className?: string } = {}) {
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
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(26, Math.min(74, Math.floor((width * height) / 28000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // (3) Breathing radial wash.
      const pulse = 0.05 + Math.sin(t / 2800) * 0.018;
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.08,
        0,
        width * 0.5,
        height * 0.08,
        Math.max(width, height),
      );
      grad.addColorStop(0, `rgba(52,211,153,${pulse})`);
      grad.addColorStop(1, 'rgba(5,5,5,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // (1) Move + link nodes.
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.16;
            ctx.strokeStyle = `rgba(52,211,153,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // (2) Floating brand orbs - soft additive glow.
      ctx.globalCompositeOperation = 'lighter';
      const orbs = [
        { x: width * 0.18, y: height * 0.28, r: 220, c: [52, 211, 153] },
        { x: width * 0.82, y: height * 0.22, r: 260, c: [34, 211, 238] },
        { x: width * 0.7, y: height * 0.7, r: 300, c: [167, 139, 250] },
        { x: width * 0.3, y: height * 0.82, r: 240, c: [212, 175, 55] },
      ];
      for (let k = 0; k < orbs.length; k++) {
        const o = orbs[k];
        const breathe = 0.05 + Math.sin(t / 3200 + k) * 0.02;
        const gx = o.x + Math.sin(t / 6000 + k) * 30;
        const gy = o.y + Math.cos(t / 7000 + k) * 24;
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.r);
        g.addColorStop(0, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},${breathe})`);
        g.addColorStop(1, `rgba(${o.c[0]},${o.c[1]},${o.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      // (1b) Node cores with a soft halo.
      for (const n of nodes) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, 'rgba(110,231,183,0.6)');
        g.addColorStop(1, 'rgba(110,231,183,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

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
        'pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-60'
      }
    />
  );
}

'use client';

import { useEffect, useRef } from 'react';

/**
 * HeroAurora — a living, pointer-reactive bioluminescent field.
 *
 * The hero's single "surreal" moment: a territory that breathes. A 2D canvas
 * draws soft gradient orbs (emerald / cyan / violet / gold) that drift slowly
 * and are gently pulled toward the pointer, plus a following spotlight — pure
 * on-brand "Sovereign Cadastre" light. Decorative (aria-hidden). Honors
 * prefers-reduced-motion with a single static frame. Performant: a handful
 * of orbs, throttled pointer, DPR-capped.
 */
export function HeroAurora({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const orbs = [
      { x: 0.3, y: 0.4, r: 0.42, c: [52, 211, 153] }, // emerald
      { x: 0.7, y: 0.35, r: 0.38, c: [34, 211, 238] }, // cyan
      { x: 0.55, y: 0.72, r: 0.4, c: [167, 139, 250] }, // violet
      { x: 0.82, y: 0.74, r: 0.32, c: [212, 175, 55] }, // gold
    ].map((o) => ({ ...o, ox: o.x, oy: o.y, ph: Math.random() * Math.PI * 2 }));
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas!.height = Math.max(1, Math.floor(rect.height * dpr));
    }
    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = (e.clientY - rect.top) / rect.height;
    }
    function blob(cx: number, cy: number, rad: number, rgb: number[], a0: number, a1: number) {
      const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
      const [r, gg, b] = rgb;
      g.addColorStop(0, `rgba(${r},${gg},${b},${a0})`);
      g.addColorStop(0.5, `rgba(${r},${gg},${b},${a1})`);
      g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx!.fill();
    }
    function frame(t: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      const time = t / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      ctx!.globalCompositeOperation = 'lighter';
      for (const o of orbs) {
        o.ox = o.x + Math.sin(time * 0.25 + o.ph) * 0.04;
        o.oy = o.y + Math.cos(time * 0.2 + o.ph) * 0.04;
        const dx = pointer.x - o.ox;
        const dy = pointer.y - o.oy;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(0.06, 0.02 / dist);
        o.ox += dx * pull;
        o.oy += dy * pull;
        blob(o.ox * w, o.oy * h, o.r * Math.max(w, h), o.c, 0.3, 0.1);
      }
      const sx = pointer.x * w;
      const sy = pointer.y * h;
      blob(sx, sy, 0.3 * Math.max(w, h), [255, 255, 255], 0.16, 0);
      ctx!.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    function drawStatic() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.globalCompositeOperation = 'lighter';
      for (const o of orbs) blob(o.x * w, o.y * h, o.r * Math.max(w, h), o.c, 0.28, 0);
      ctx!.globalCompositeOperation = 'source-over';
    }
    resize();
    window.addEventListener('resize', resize);
    if (reduce) {
      drawStatic();
    } else {
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none h-full w-full ${className}`} />;
}

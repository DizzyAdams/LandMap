/**
 * SkylineCanvas — a generative, animated city skyline rendered as inline SVG.
 *
 * The product is data, not photos, and we can't ship raster images offline, so
 * instead of a flat gray hero we synthesise a living skyline: procedurally
 * generated skyscrapers (deterministic per `seed`) with windows that flicker
 * on, a slow parallax drift, reflections in the "bay" and a bioluminescent
 * horizon glow. It reads like a premium product hero, scales infinitely and is
 * fully on-brand. Decorative → aria-hidden. Honors prefers-reduced-motion via
 * the CSS `motion-reduce` guard at the call site.
 */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function SkylineCanvas({ className = '' }: { className?: string }) {
  // Stable seed so the skyline is identical across renders/SSR.
  const r = rng(0x1a2b3c);
  const W = 320;
  const floorY = 230;
  const towers = Array.from({ length: 13 }, (_, i) => {
    const w = 16 + Math.floor(r() * 22);
    const h = 60 + Math.floor(r() * 150);
    const x = i * (W / 13) + (r() * 4 - 2);
    const windows: { x: number; y: number; lit: boolean; delay: number }[] = [];
    const cols = Math.max(2, Math.floor(w / 9));
    const rowsN = Math.floor(h / 12);
    for (let c = 0; c < cols; c++) {
      for (let rw = 0; rw < rowsN; rw++) {
        windows.push({
          x: x + 4 + c * 9,
          y: floorY - h + 8 + rw * 12,
          lit: r() > 0.45,
          delay: r() * 3,
        });
      }
    }
    return { x, w, h, windows, gold: r() > 0.82 };
  });

  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-700/5 to-transparent" />
      <svg viewBox={`0 0 ${W} 260`} className="h-full w-full motion-reduce:animate-none" fill="none" role="presentation">
        <defs>
          <linearGradient id="sk-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2a26" />
            <stop offset="100%" stopColor="#0a0f0d" />
          </linearGradient>
          <linearGradient id="sk-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2f12" />
            <stop offset="100%" stopColor="#0a0f0d" />
          </linearGradient>
          <linearGradient id="sk-horizon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizon glow */}
        <rect x="0" y={floorY - 40} width={W} height="60" fill="url(#sk-horizon)" />

        <g className="motion-reduce:animate-none" style={{ animation: 'sk-drift 26s ease-in-out infinite alternate' }}>
          {towers.map((t, i) => (
            <g key={i}>
              <rect
                x={t.x}
                y={floorY - t.h}
                width={t.w}
                height={t.h}
                rx="2"
                fill={t.gold ? 'url(#sk-gold)' : 'url(#sk-fill)'}
                stroke={t.gold ? 'rgba(212,175,55,0.35)' : 'rgba(52,211,153,0.22)'}
                strokeWidth="0.6"
              />
              {t.windows.map((win, j) =>
                win.lit ? (
                  <rect
                    key={j}
                    x={win.x}
                    y={win.y}
                    width="4"
                    height="5"
                    rx="0.5"
                    fill={t.gold ? '#e8c873' : '#6ee7b7'}
                    fillOpacity="0.85"
                  >
                    <animate
                      attributeName="fill-opacity"
                      values="0.85;0.25;0.85"
                      dur={`${2.4 + (j % 5) * 0.6}s`}
                      begin={`${win.delay}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                ) : (
                  <rect key={j} x={win.x} y={win.y} width="4" height="5" rx="0.5" fill="rgba(255,255,255,0.05)" />
                ),
              )}
            </g>
          ))}
        </g>

        {/* bay reflection */}
        <g transform={`translate(0 ${floorY * 2}) scale(1 -1)`} opacity="0.12">
          {towers.map((t, i) => (
            <rect key={i} x={t.x} y={floorY - t.h} width={t.w} height={t.h} rx="2" fill={t.gold ? '#e8c873' : '#34d399'} />
          ))}
        </g>
        <rect x="0" y={floorY} width={W} height="30" fill="#050505" />
      </svg>

      <style>{`@keyframes sk-drift { from { transform: translateX(-4px); } to { transform: translateX(4px); } }`}</style>
    </div>
  );
}

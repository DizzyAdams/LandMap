/**
 * HeroTerritory — a self-contained, animated SVG "data territory" visual.
 *
 * The site was almost entirely text/data with no imagery, which made the hero
 * feel empty. Rather than ship raster assets (which break offline / need a CDN),
 * this is pure inline SVG + SMIL animation: a stylised cadastral plot grid with
 * a rotating survey compass, glowing emerald parcels that pulse, a flowing data
 * line and a slow scan sweep — on-brand ("Sovereign Cadastre") and infinitely
 * scalable. Decorative, so it's aria-hidden.
 */
export function HeroTerritory({ className = '' }: { className?: string }) {
  const cols = 6;
  const rows = 6;
  const cell = 46;
  const hot = new Set(['1-2', '3-1', '4-4', '2-4', '0-3', '5-2']);

  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="gold-aura pointer-events-none absolute inset-0 -z-10 scale-110 rounded-full opacity-70" />
      <svg viewBox="0 0 360 360" className="h-full w-full" fill="none" role="presentation">
        <defs>
          <linearGradient id="ht-emerald" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="55%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="ht-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4e2a1" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <radialGradient id="ht-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>
          <filter id="ht-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <g transform="translate(180 180)">
          <g>
            <circle r="150" stroke="rgba(212,175,55,0.28)" strokeWidth="1" />
            <circle r="120" stroke="rgba(212,175,55,0.16)" strokeWidth="1" strokeDasharray="2 6" />
            {Array.from({ length: 24 }).map((_, i) => {
              const a = (i / 24) * Math.PI * 2;
              const outer = 150;
              const inner = i % 6 === 0 ? 138 : 144;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * outer}
                  y1={Math.sin(a) * outer}
                  x2={Math.cos(a) * inner}
                  y2={Math.sin(a) * inner}
                  stroke="rgba(212,175,55,0.35)"
                  strokeWidth="1"
                />
              );
            })}
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="90s" repeatCount="indefinite" />
          </g>
          <circle r="96" stroke="rgba(34,211,238,0.25)" strokeWidth="1" strokeDasharray="4 10">
            <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="60s" repeatCount="indefinite" />
          </circle>
        </g>

        <g transform={`translate(${180 - (cols * cell) / 2} ${180 - (rows * cell) / 2})`}>
          {Array.from({ length: rows }).flatMap((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const key = `${c}-${r}`;
              const isHot = hot.has(key);
              const x = c * cell;
              const y = r * cell;
              return (
                <g key={key}>
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width={cell - 6}
                    height={cell - 6}
                    rx="4"
                    stroke={isHot ? 'url(#ht-emerald)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth={isHot ? 1.4 : 1}
                    fill={isHot ? 'rgba(52,211,153,0.10)' : 'rgba(255,255,255,0.015)'}
                  >
                    {isHot && (
                      <animate attributeName="opacity" values="0.55;1;0.55" dur={`${2.6 + (c % 3) * 0.7}s`} repeatCount="indefinite" />
                    )}
                  </rect>
                  {isHot && (
                    <circle cx={x + cell / 2} cy={y + cell / 2} r="3" fill="url(#ht-emerald)">
                      <animate attributeName="r" values="2;3.6;2" dur="2.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            }),
          )}
        </g>

        <path
          d="M40 250 C 120 180, 150 140, 220 150 S 320 120, 330 70"
          stroke="url(#ht-emerald)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 8"
          opacity="0.7"
        >
          <animate attributeName="stroke-dashoffset" values="0;-120" dur="4s" repeatCount="indefinite" />
        </path>
        <circle r="3.5" fill="url(#ht-glow)">
          <animateMotion dur="4s" repeatCount="indefinite" path="M40 250 C 120 180, 150 140, 220 150 S 320 120, 330 70" />
        </circle>

        <rect x="0" y="0" width="360" height="26" fill="url(#ht-glow)" opacity="0.14" filter="url(#ht-blur)">
          <animate attributeName="y" values="-26;360" dur="7s" repeatCount="indefinite" />
        </rect>

        <g transform="translate(180 180)">
          <circle r="6" fill="none" stroke="url(#ht-gold)" strokeWidth="1.5" />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="url(#ht-gold)" strokeWidth="1.5" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#ht-gold)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

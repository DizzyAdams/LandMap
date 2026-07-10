/**
 * PropertyThumb — a deterministic, generative "blueprint" thumbnail.
 *
 * Properties have no photos in the open dataset, which left cards looking bare.
 * Instead of a generic gray box, we synthesise a unique on-brand blueprint from
 * the property id: a cadastral plot with a building silhouette whose floors,
 * windows and footprint are derived from a stable hash — so the same listing
 * always renders the same little artwork. Pure SVG, SSR-safe, no assets.
 */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function PropertyThumb({
  seed,
  className = '',
  label,
}: {
  seed: string;
  className?: string;
  label?: string;
}) {
  const h = hash(seed);
  const floors = 3 + (h % 5); // 3..7
  const bays = 3 + ((h >> 3) % 4); // 3..6 window columns
  const wide = ((h >> 6) % 2) === 0;
  const hueGold = ((h >> 7) % 3) === 0; // some plots use the sovereign gold accent
  const stroke = hueGold ? '#d4af37' : '#34d399';
  const fillFrom = hueGold ? '#f4e2a1' : '#6ee7b7';
  const uid = `pt${h.toString(36)}`;

  const bw = wide ? 78 : 58;
  const bx = (120 - bw) / 2;
  const floorH = 15;
  const bh = floors * floorH;
  const by = 150 - bh - 14;

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} aria-hidden>
      <svg viewBox="0 0 120 150" className="h-full w-full" fill="none" role="presentation">
        <defs>
          <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={fillFrom} stopOpacity="0.9" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b0b0b" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="120" height="150" fill={`url(#${uid}-bg)`} />

        {/* cadastral grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 17} y1="0" x2={i * 17} y2="150" stroke="rgba(255,255,255,0.045)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 17} x2="120" y2={i * 17} stroke="rgba(255,255,255,0.045)" strokeWidth="0.5" />
        ))}

        {/* plot outline */}
        <rect x="10" y="118" width="100" height="20" rx="2" stroke={stroke} strokeOpacity="0.5" strokeDasharray="3 4" />

        {/* building */}
        <rect x={bx} y={by} width={bw} height={bh} rx="2" fill={`url(#${uid}-b)`} fillOpacity="0.14" stroke={stroke} strokeWidth="1.2" />

        {/* windows grid */}
        {Array.from({ length: floors }).flatMap((_, f) =>
          Array.from({ length: bays }).map((__, b) => {
            const wx = bx + 6 + b * ((bw - 12) / bays);
            const wy = by + 5 + f * floorH;
            const lit = ((h >> (f + b)) & 1) === 1;
            return (
              <rect
                key={`w${f}-${b}`}
                x={wx}
                y={wy}
                width={(bw - 12) / bays - 3}
                height={floorH - 7}
                rx="1"
                fill={lit ? fillFrom : 'rgba(255,255,255,0.06)'}
                fillOpacity={lit ? 0.85 : 1}
              >
                {lit && <animate attributeName="fill-opacity" values="0.85;0.35;0.85" dur={`${3 + ((f + b) % 4)}s`} repeatCount="indefinite" />}
              </rect>
            );
          }),
        )}

        {/* roof marker */}
        <circle cx="60" cy={by - 6} r="2.4" fill={stroke}>
          <animate attributeName="r" values="1.8;3;1.8" dur="3s" repeatCount="indefinite" />
        </circle>
        <line x1="60" y1={by - 6} x2="60" y2={by} stroke={stroke} strokeWidth="1" strokeOpacity="0.6" />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}

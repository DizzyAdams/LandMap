'use client';

type PricePoint = {
  date: string;
  price: number;
};

type PriceHistoryProps = {
  history: PricePoint[];
};

export function PriceHistory({ history }: PriceHistoryProps) {
  if (!history || history.length < 2) {
    return null;
  }

  const W = 600;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 32, left: 60 };

  const prices = history.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const xScale = (i: number) => pad.left + (i / (history.length - 1)) * (W - pad.left - pad.right);
  const yScale = (v: number) => pad.top + ((max - v) / range) * (H - pad.top - pad.bottom);

  const points = history.map((_, i) => `${xScale(i)},${yScale(prices[i])}`).join(' ');

  const yTicks = 4;
  const yLabels: number[] = [];
  for (let i = 0; i <= yTicks; i++) {
    yLabels.push(min + (range * i) / yTicks);
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">Histórico de preços</p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Histórico de preços: de ${history[0].date} a ${history[history.length - 1].date}`}
      >
        {/* Grid lines */}
        {yLabels.map((v, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              y1={yScale(v)}
              x2={W - pad.right}
              y2={yScale(v)}
              stroke="#262626"
              strokeWidth={1}
            />
            <text
              x={pad.left - 6}
              y={yScale(v) + 4}
              textAnchor="end"
              fill="#737373"
              fontSize={10}
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#a3a3a3"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {history.map((p, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p.price)}
            r={3}
            fill="var(--primary)"
            stroke="var(--border)"
            strokeWidth={1.5}
          />
        ))}

        {/* Date labels */}
        {[0, Math.floor(history.length / 4), Math.floor(history.length / 2), Math.floor((3 * history.length) / 4), history.length - 1].map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={H - 4}
            textAnchor="middle"
            fill="#737373"
            fontSize={10}
          >
            {history[i].date}
          </text>
        ))}
      </svg>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { LANDMAP_API_BASE } from '../../../../lib/api';
import { GlowPanel } from '../../../../components/GlowPanel';

type StatsData = {
  totalProperties: number;
  totalAvailable: number;
  totalSold: number;
  totalCities: number;
  avgPrice: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
  typeStats: { type: string; count: number; avgPrice: number; avgAreaM2: number }[];
  topCities: { city: string; state: string; count: number; avgPrice: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
};

type CityData = {
  city: string;
  state: string;
  count: number;
  avgPrice: number;
};

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#34d399', '#ef4444', '#22d3ee', '#a78bfa'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${LANDMAP_API_BASE}/admin/stats`, { cache: 'no-store' }).then((r) => r.json()),
      fetch(`${LANDMAP_API_BASE}/cities`, { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([statsData, citiesData]) => {
        setStats(statsData);
        setCities(citiesData.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/20" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-neutral-400">Erro ao carregar dados.</p>;
  }

  const typeEntries = Object.entries(stats.byType);
  const typeLabels: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    terreno: 'Terreno',
    comercial: 'Comercial',
  };

  const modalityEntries = Object.entries(stats.byModality);
  const modalityLabels: Record<string, string> = {
    venda: 'Venda',
    aluguel: 'Aluguel',
    lancamento: 'Lançamento',
  };

  const top = stats.topCities.slice(0, 8);

  return (
    <div>
      <span className="kicker">Inteligência de dados</span>
      <h2 className="mt-2 text-lg font-medium text-neutral-50">Analytics</h2>
      <p className="mt-1 text-xs text-neutral-400">
        Dados e distribuição dos imóveis
      </p>

      <GlowPanel className="mt-8 p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart: Imóveis por tipo */}
        <ChartCard title="Imóveis por Tipo">
          <BarChart
            labels={typeEntries.map(([k]) => typeLabels[k] ?? k)}
            values={typeEntries.map(([, v]) => v)}
            color="#10b981"
            height={200}
          />
        </ChartCard>

        {/* Chart: Preço médio por cidade */}
        <ChartCard title="Preço Médio por Cidade">
          <BarChart
            labels={top.map((c) => c.city)}
            values={top.map((c) => Math.round(c.avgPrice / 1000))}
            suffix="k"
            color="#06b6d4"
            height={200}
          />
        </ChartCard>

        {/* Chart: Distribuição por Modalidade (pie) */}
        <ChartCard title="Distribuição por Modalidade">
          <PieChart
            labels={modalityEntries.map(([k]) => modalityLabels[k] ?? k)}
            values={modalityEntries.map(([, v]) => v)}
            height={220}
          />
        </ChartCard>

        {/* Chart: Faixas de Preço */}
        <ChartCard title="Faixas de Preço">
          <BarChart
            labels={stats.priceRanges.map((r) => r.label)}
            values={stats.priceRanges.map((r) => r.count)}
            color="#a855f7"
            height={200}
          />
        </ChartCard>
      </div>
      </GlowPanel>

      {/* Type stats detail */}
      <div className="mt-8">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Detalhamento por Tipo
          </h3>
        <GlowPanel className="p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.typeStats.map((t, i) => (
            <div
              key={t.type}
              className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4"
            >
              <p className="text-xs text-neutral-400">{typeLabels[t.type] ?? t.type}</p>
              <p className="mt-1 text-lg font-semibold text-neutral-50">{t.count}</p>
              <p className="mt-1 text-[11px] text-neutral-400">
                {formatBRL(t.avgPrice)} · {t.avgAreaM2} m²
              </p>
            </div>
          ))}
        </div>
        </GlowPanel>
      </div>
    </div>
  );
}

/* ─── Chart Components ─── */

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-neutral-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function BarChart({
  labels,
  values,
  color,
  height,
  suffix,
}: {
  labels: string[];
  values: number[];
  color: string;
  height: number;
  suffix?: string;
}) {
  const max = Math.max(...values, 1);
  const w = Math.max(40, Math.min(80, 600 / labels.length));
  const totalW = labels.length * (w + 8) + 16;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${height}`}
      className="w-full"
      style={{ height }}
    >
      {/* Y axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = height - 20 - ratio * (height - 40);
        return (
          <g key={ratio}>
            <line
              x1={0}
              y1={y}
              x2={totalW}
              y2={y}
              stroke="#262626"
              strokeWidth={1}
            />
            <text x={4} y={y + 3} fill="#525252" fontSize={9}>
              {Math.round(max * ratio)}
              {suffix ?? ''}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {labels.map((label, i) => {
        const barH = ((values[i] / max) * (height - 40));
        const x = 16 + i * (w + 8);
        const y = height - 20 - barH;
        return (
          <g key={label}>
            <rect
              x={x}
              y={y}
              width={w}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.8}
            />
            <text
              x={x + w / 2}
              y={height - 4}
              textAnchor="middle"
              fill="#737373"
              fontSize={8}
            >
              {label.length > 10 ? label.slice(0, 10) + '…' : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({
  labels,
  values,
  height,
}: {
  labels: string[];
  values: number[];
  height: number;
}) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = 100;
  const cy = height / 2;
  const r = Math.min(80, cy - 10);
  const legendX = cx + r + 24;

  let cumulative = 0;
  const slices = values.map((v, i) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += v;
    const endAngle = (cumulative / total) * 360;
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return {
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      label: labels[i],
      value: values[i],
      pct: Math.round((values[i] / total) * 100),
    };
  });

  const svgW = legendX + 120;

  return (
    <svg viewBox={`0 0 ${svgW} ${height}`} className="w-full" style={{ height }}>
      {slices.map((s) => (
        <path key={s.label} d={s.path} fill={s.color} opacity={0.85} />
      ))}
      {slices.map((s, i) => (
        <g key={`leg-${s.label}`}>
          <rect x={legendX} y={10 + i * 22} width={10} height={10} rx={2} fill={s.color} />
          <text x={legendX + 16} y={19 + i * 22} fill="#a3a3a3" fontSize={10}>
            {s.label}
          </text>
          <text x={legendX + 16 + 100} y={19 + i * 22} fill="#737373" fontSize={10}>
            {s.pct}%
          </text>
        </g>
      ))}
    </svg>
  );
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

'use client';

import { useEffect, useState } from 'react';
import { LANDMAP_API_BASE } from '../../../lib/api';

type AdminStats = {
  totalProperties: number;
  totalAvailable: number;
  totalSold: number;
  totalCities: number;
  avgPrice: number;
  medPrice: number;
  minPrice: number;
  maxPrice: number;
  totalAreaM2: number;
  avgAreaM2: number;
};

export const dynamic = 'force-dynamic';

const SIMULATED_LEADS = 47;
const SIMULATED_VIEWS = 1283;
const SIMULATED_CONVERSION = 3.2;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${LANDMAP_API_BASE}/admin/stats`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: 'Total de Imóveis',
          value: stats.totalProperties,
          sub: `${stats.totalAvailable} disponíveis · ${stats.totalSold} vendidos`,
          color: 'border-l-emerald-500',
        },
        {
          label: 'Leads',
          value: SIMULATED_LEADS,
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-emerald-500',
        },
        {
          label: 'Visitas Simuladas',
          value: SIMULATED_VIEWS.toLocaleString('pt-BR'),
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-violet-500',
        },
        {
          label: 'Taxa de Conversão',
          value: `${SIMULATED_CONVERSION}%`,
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-violet-500',
        },
      ]
    : [];

  return (
    <div>
      <h2 className="text-lg font-medium text-neutral-50">Dashboard</h2>
      <p className="mt-1 text-xs text-neutral-400">
        Resumo geral do LandMap
      </p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/20"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 border-l-4 ${card.color}`}
              >
                <p className="text-xs text-neutral-400">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-50">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Secondary stats */}
          {stats && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Preço médio', value: formatBRL(stats.avgPrice) },
              { label: 'Preço mediano', value: formatBRL(stats.medPrice) },
              { label: 'Menor preço', value: formatBRL(stats.minPrice) },
              { label: 'Maior preço', value: formatBRL(stats.maxPrice) },
              { label: 'Cidades', value: stats.totalCities },
              { label: 'Área total', value: `${stats.totalAreaM2.toLocaleString('pt-BR')} m²` },
              { label: 'Área média', value: `${stats.avgAreaM2} m²` },
              { label: 'Total disponíveis', value: stats.totalAvailable },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4"
              >
                <p className="text-[11px] text-neutral-400">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-neutral-50">{item.value}</p>
              </div>
            ))}
          </div>
          )}
        </>
      )}
    </div>
  );
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

'use client';

import { useEffect, useState } from 'react';
import { RequireAuth } from '../../../components/RequireAuth';
import { LANDMAP_API_BASE } from '../../../lib/api';
import { Sparkles } from '../../../components/lovable/icons';
import { Stagger } from '../../../components/Motion';

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

function AdminDashboardPageInner() {
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
          label: 'Total de Terrenos',
          value: stats.totalProperties,
          sub: `${stats.totalAvailable} disponíveis · ${stats.totalSold} vendidos`,
          color: 'border-l-[var(--primary)]',
        },
        {
          label: 'Leads',
          value: SIMULATED_LEADS,
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-[var(--primary)]',
        },
        {
          label: 'Visitas Simuladas',
          value: SIMULATED_VIEWS.toLocaleString('pt-BR'),
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-[var(--ring)]',
        },
        {
          label: 'Taxa de Conversão',
          value: `${SIMULATED_CONVERSION}%`,
          sub: 'exemplo · dados de demonstração',
          color: 'border-l-[var(--ring)]',
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Painel Administrativo</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">Resumo geral do LandMap</p>
        </div>
      </header>

      {loading ? (
        <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.08} y={20}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--muted)]"
            />
          ))}
        </Stagger>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          {/* Stats cards */}
          <Stagger className="grid gap-4 sm:grid-cols-2" stagger={0.08} y={20}>
            {cards.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 border-l-4 ${card.color}`}
              >
                <p className="text-xs text-[var(--muted-foreground)]">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{card.sub}</p>
              </div>
            ))}
          </Stagger>

          {/* Secondary stats */}
          {stats && (
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06} y={16}>
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
                className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4"
              >
                <p className="text-[11px] text-[var(--muted-foreground)]">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </Stagger>
          )}
        </div>
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

export default function AdminDashboardPage() {
  return (
    <RequireAuth>
      <AdminDashboardPageInner />
    </RequireAuth>
  );
}

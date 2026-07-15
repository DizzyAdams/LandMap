'use client';

import Link from 'next/link';
import { RequireAuth } from '../../../components/RequireAuth';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
  TrendingUp,
  MapPin,
  Activity,
  Building2,
  ShieldCheck,
  LineChart,
  BarChart,
  ArrowUpDown,
  BellRing,
  LandMapWordmark,
} from '../../../components/lovable/icons';
import {
  Card,
  MetricStat,
  Sparkline,
  Progress,
  Badge,
  StatPill,
  Skeleton,
  EmptyState,
} from '@landmap/ui';

/* ── KPI cards — preserve existing PT-BR copy exactly ── */
type KpiItem = {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
  tone: 'emerald' | 'cyan' | 'violet' | 'gold' | 'neutral';
  hint?: string;
};

const KPI_DATA: KpiItem[] = [
  { label: 'Valorização média', value: '↑ 2,4%', icon: TrendingUp, tone: 'emerald', hint: 'vs. mês anterior' },
  { label: 'Preço médio/m²', value: 'R$ 7.200', icon: MapPin, tone: 'violet', hint: 'média nacional' },
  { label: 'Bairros monitorados', value: '24', icon: Activity, tone: 'neutral', hint: 'em 6 cidades' },
  { label: 'Imóveis ativos', value: '1.847', icon: Building2, tone: 'cyan', hint: 'ativos agora' },
  { label: 'Confiança dos dados', value: '94%', icon: ShieldCheck, tone: 'gold', hint: 'índice de qualidade' },
];

/* ── Demo series for charts (this view has no backend fetch of its own) ── */
const REGION_TREND = [12, 18, 15, 22, 28, 24, 33, 31, 38, 44];

type RegionRow = { city: string; price: string; delta: number };

/* Mirrors the "Últimas transações" copy used on the home screen. */
const RECENT: RegionRow[] = [
  { city: 'São Paulo', price: 'R$ 1,2M', delta: 4.2 },
  { city: 'Curitiba', price: 'R$ 860k', delta: 2.8 },
  { city: 'Florianópolis', price: 'R$ 1,4M', delta: 5.1 },
  { city: 'Belo Horizonte', price: 'R$ 720k', delta: -1.3 },
  { city: 'Recife', price: 'R$ 640k', delta: 3.4 },
];

const DISTRIBUTION = [
  { label: 'Residencial', pct: 62 },
  { label: 'Comercial', pct: 24 },
  { label: 'Industrial', pct: 14 },
];

function DashboardPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async data load for this view.
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-background text-[var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href={lh('/')} aria-label="Início" className="transition hover:opacity-80">
              <LandMapWordmark />
            </Link>
            <span className="hidden text-sm text-[var(--muted-foreground)] sm:inline">Painel</span>
          </div>
          <div className="flex items-center gap-2">
            <StatPill icon={<BellRing size={13} />} value="3" label="alertas" tone="emerald" />
            <Link
              href={lh('/map')}
              className="inline-flex h-9 items-center rounded-full border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
            >
              Abrir mapa
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="mb-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <p className="eyebrow">Inteligência de terrenos</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Visão geral do mercado
          </h1>
        </div>

        {/* Stat cards row */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 sm:grid-cols-3 lg:grid-cols-5">
            {KPI_DATA.map((k) => (
              <Skeleton key={k.label} className="h-[92px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 sm:grid-cols-3 lg:grid-cols-5">
            {KPI_DATA.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <MetricStat
                  key={kpi.label}
                  label={kpi.label}
                  value={kpi.value}
                  tone={kpi.tone}
                  hint={kpi.hint}
                  icon={<Icon size={14} />}
                />
              );
            })}
          </div>
        )}

        {/* Charts + distribution */}
        <div className="mt-6 grid grid-cols-1 gap-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart size={16} className="text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Valorização por região</h2>
              </div>
              <Link
                href={lh('/regions')}
                className="text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
              >
                Ver regiões
              </Link>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <Sparkline data={REGION_TREND} width={280} height={64} />
              <div className="flex flex-col gap-1">
                <StatPill icon={<TrendingUp size={12} />} value="+2,4%" tone="emerald" />
                <Badge variant="success">Em alta</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <BarChart size={16} className="text-[var(--primary)]" />
              <h2 className="text-sm font-semibold">Distribuição por tipo</h2>
            </div>
            <div className="space-y-4">
              {DISTRIBUTION.map((d) => (
                <div key={d.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">{d.label}</span>
                    <span className="font-medium text-[var(--foreground)]">{d.pct}%</span>
                  </div>
                  <Progress value={d.pct} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent list */}
        <div className="mt-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <ArrowUpDown size={16} className="text-[var(--primary)]" />
              <h2 className="text-sm font-semibold">Últimas transações</h2>
            </div>
            {loading ? (
              <Skeleton className="h-40 rounded-lg" />
            ) : RECENT.length > 0 ? (
              <ul>
                {RECENT.map((r) => (
                  <li
                    key={r.city}
                    className="flex items-center justify-between border-b border-[var(--border)] py-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--muted)]">
                        <Building2 size={14} className="text-[var(--muted-foreground)]" />
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">{r.city}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{r.price}</span>
                      <Badge variant={r.delta >= 0 ? 'success' : 'destructive'}>
                        {r.delta >= 0 ? '▲' : '▼'} {Math.abs(r.delta).toFixed(1)}%
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="Nenhuma transação recente"
                description="Os dados aparecem aqui assim que houver atividade."
              />
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardPageInner />
    </RequireAuth>
  );
}

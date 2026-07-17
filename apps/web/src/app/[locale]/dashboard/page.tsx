'use client';

/**
 * Dashboard = atalho para o Mapa Intelligence (paridade Lovable:
 * a superfície "Mapa — LandMap" é o mapa full-bleed em /map).
 * Mantém overview KPI + CTA para o mapa.
 */

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { RequireAuth } from '../../../components/RequireAuth';
import {
  LandMapWordmark,
  TrendingUp,
  MapPin,
  Activity,
  ArrowLeft,
  Layers,
} from '../../../components/lovable/icons';
import { Card, Badge, Stat, Sparkline, buttonVariants, cn } from '@landmap/ui';
import {
  COPY,
  INTELLIGENCE_REGIONS,
  fmtDelta,
  fmtPriceSqm,
  topByScore,
  topByValorization,
} from '../../../lib/mapIntelligence';

function DashboardInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const topVal = topByValorization(3);
  const topOpp = topByScore(3);
  const avgPrice = Math.round(
    INTELLIGENCE_REGIONS.reduce((s, r) => s + r.priceSqm, 0) / INTELLIGENCE_REGIONS.length,
  );
  const spark = INTELLIGENCE_REGIONS[0].priceHistory.map((p) => p.value);

  return (
    <main className="min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href={lh('/')} aria-label="Início" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <LandMapWordmark />
            <span className="hidden text-sm text-muted-foreground sm:inline">Painel</span>
          </div>
          <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }), 'min-h-9')}>
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Abrir mapa
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 sm:px-6">
        <div>
          <p className="text-sm font-medium text-primary">Inteligência de terrenos</p>
          <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
            Visão geral do mercado
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O mapa completo com camadas Lovable está em{' '}
            <Link href={lh('/map')} className="font-medium text-primary underline-offset-2 hover:underline">
              /map
            </Link>
            .
          </p>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={COPY.avgPrice} value={fmtPriceSqm(avgPrice)} />
          <Stat label="Regiões" value={String(INTELLIGENCE_REGIONS.length)} />
          <Stat label={COPY.hottest} value={topVal[0]?.name ?? '—'} />
          <Stat label={COPY.score} value={String(topOpp[0]?.score ?? '—')} />
        </section>

        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{COPY.indexFlow}</h2>
            <Badge variant="outline">{COPY.last7Years}</Badge>
          </div>
          <Sparkline data={spark} width={320} height={56} />
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {COPY.topValorization}
            </h2>
            <ul className="space-y-2">
              {topVal.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="font-medium text-primary">{fmtDelta(r.priceSqmDelta12m)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {COPY.topOpportunities}
            </h2>
            <ul className="space-y-2">
              {topOpp.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>{r.name}</span>
                  <Badge variant="outline">{r.score}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Link
          href={lh('/map')}
          className={cn(buttonVariants({ size: 'lg' }), 'w-full sm:w-auto')}
        >
          Abrir mapa intelligence (camadas · heatmap · score)
        </Link>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

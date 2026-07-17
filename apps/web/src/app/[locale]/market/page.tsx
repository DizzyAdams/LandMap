'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import {
  ArrowLeft,
  Activity,
  TrendingUp,
  LandMapWordmark,
  LineChart,
} from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Sparkline, buttonVariants, cn } from '@landmap/ui';
import {
  COPY,
  INTELLIGENCE_REGIONS,
  fmtPriceSqm,
  topByLayer,
  topOpportunities,
} from '../../../lib/mapIntelligence';

export default function MarketPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const avgPrice = useMemo(
    () =>
      Math.round(
        INTELLIGENCE_REGIONS.reduce((s, r) => s + r.priceSqm, 0) /
          INTELLIGENCE_REGIONS.length,
      ),
    [],
  );
  const avgScore = useMemo(
    () =>
      Math.round(
        INTELLIGENCE_REGIONS.reduce((s, r) => s + r.score, 0) /
          INTELLIGENCE_REGIONS.length,
      ),
    [],
  );
  const trend = useMemo(
    () => [0.88, 0.91, 0.93, 0.96, 0.98, 1, 1.03, 1.05].map((k) => Math.round(avgPrice * k)),
    [avgPrice],
  );
  const tops = topByLayer('valorization', 4);
  const opps = topOpportunities(4);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/dashboard')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Activity className="h-3 w-3" />
          Mercado
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Snapshot do mercado
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Visão agregada Fortaleza/metro — mesma base do Score LandMap.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={COPY.avgPrice} value={fmtPriceSqm(avgPrice)} />
        <Stat label={COPY.score} value={String(avgScore)} />
        <Stat label="Regiões" value={String(INTELLIGENCE_REGIONS.length)} />
        <Stat label={COPY.hottest} value={tops[0]?.name ?? '—'} />
      </section>

      <Card className="mt-6 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{COPY.history}</h2>
          </div>
          <Badge variant="outline">{COPY.historyRange}</Badge>
        </div>
        <Sparkline data={trend} width={280} height={56} aria-label="Tendência de preço" />
        <p className="mt-2 text-xs text-muted-foreground">{COPY.scoreHint}</p>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/dashboard')} className={cn(buttonVariants({ size: 'sm' }))}>
          Mapa intelligence
        </Link>
        <Link href={lh('/valorization')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Valorização
        </Link>
        <Link href={lh('/alerts')} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          Alertas
        </Link>
      </div>

      <Reveal className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            {COPY.topValorization}
          </h2>
          <ul className="space-y-2">
            {tops.map((r, i) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>
                  {i + 1}. {r.name}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {r.layerScores.valorization}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold">{COPY.topOpportunities}</h2>
          <ul className="space-y-2">
            {opps.map((r) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span>{r.name}</span>
                <Badge variant="outline">{r.score}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </main>
  );
}

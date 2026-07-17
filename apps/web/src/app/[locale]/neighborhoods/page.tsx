'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  LandMapWordmark,
} from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Progress, buttonVariants, cn } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtPriceSqm,
  scoreLabel,
} from '../../../lib/mapIntelligence';

export default function NeighborhoodsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return INTELLIGENCE_REGIONS.filter(
      (r) =>
        !s ||
        r.name.toLowerCase().includes(s) ||
        r.city.toLowerCase().includes(s),
    ).sort((a, b) => b.score - a.score);
  }, [q]);

  const avgScore =
    rows.length > 0 ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/cities')}
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
          <MapPin className="h-3 w-3" />
          Bairros
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Ranking de bairros
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Score LandMap, preço/m² e camadas — mesmos dados do mapa intelligence.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Bairros" value={String(rows.length)} />
        <Stat label="Score médio" value={String(avgScore)} />
        <Stat
          label="Top"
          value={rows[0]?.name ?? '—'}
        />
      </section>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filtrar bairro ou cidade…"
        className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none focus:border-primary"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={lh('/dashboard')} className={cn(buttonVariants({ size: 'sm' }))}>
          Abrir no mapa
        </Link>
        <Link href={lh('/compare')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Comparar
        </Link>
      </div>

      <Reveal className="mt-6 space-y-3">
        {rows.map((r) => (
          <Card key={r.id} variant="interactive" className="p-4">
            <Link href={lh('/dashboard')} className="block">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {r.city}, {r.state} · {fmtPriceSqm(r.priceSqm)}/m²
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={r.score >= 85 ? 'success' : r.score >= 55 ? 'info' : 'warning'}>
                    {scoreLabel(r.score)}
                  </Badge>
                  <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                    {r.score}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Valorização</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {r.layerScores.valorization ?? '—'}
                  </span>
                </div>
                <Progress value={r.layerScores.valorization ?? 0} />
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}

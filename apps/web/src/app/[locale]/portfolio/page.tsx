'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  LandMapWordmark,
  Star,
} from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn, EmptyState } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtPriceSqm,
  scoreLabel,
} from '../../../lib/mapIntelligence';
import { getFavoriteIds } from '../../../lib/favorites';

/** Carteira: favoritos de regiões (localStorage) + amostra intelligence. */
export default function PortfolioPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      setFavIds(getFavoriteIds());
    } catch {
      setFavIds([]);
    }
  }, []);

  const fromIntel = useMemo(() => {
    // Match favorites by name/id when possible; else top score sample
    const byName = INTELLIGENCE_REGIONS.filter(
      (r) => favIds.includes(r.id) || favIds.some((id) => id.includes(r.name)),
    );
    if (byName.length > 0) return byName;
    return INTELLIGENCE_REGIONS.filter((r) => r.score >= 85).slice(0, 4);
  }, [favIds]);

  const totalValue = fromIntel.reduce((s, r) => s + r.priceSqm * 200, 0);
  const avgScore =
    fromIntel.length > 0
      ? Math.round(fromIntel.reduce((s, r) => s + r.score, 0) / fromIntel.length)
      : 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/favorites')}
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
          <Building2 className="h-3 w-3" />
          Carteira
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Carteira de regiões
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Áreas salvas e oportunidades de alto Score LandMap.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Ativos" value={String(fromIntel.length)} />
        <Stat label="Score médio" value={String(avgScore)} />
        <Stat label="Proxy m²×200" value={fmtPriceSqm(totalValue)} />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/favorites')} className={cn(buttonVariants({ size: 'sm' }))}>
          <Star className="mr-1 h-3.5 w-3.5" />
          Favoritos
        </Link>
        <Link href={lh('/compare')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Comparar
        </Link>
        <Link href={lh('/dashboard')} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          Mapa
        </Link>
      </div>

      {fromIntel.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Carteira vazia"
            description="Salve regiões em Favoritos ou explore o mapa intelligence."
          />
        </div>
      ) : (
        <Reveal className="mt-6 space-y-3">
          {fromIntel.map((r) => (
            <Card key={r.id} variant="interactive" className="p-4">
              <Link href={lh('/dashboard')} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.city}, {r.state} · {fmtPriceSqm(r.priceSqm)}/m²
                    </p>
                  </div>
                  <Badge variant={r.score >= 85 ? 'success' : 'info'}>
                    {scoreLabel(r.score)} · {r.score}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {r.highlights[0]}
                </p>
              </Link>
            </Card>
          ))}
        </Reveal>
      )}
    </main>
  );
}

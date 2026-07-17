'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Star, TrendingUp } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Progress, buttonVariants, cn } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtDelta,
  fmtPriceSqm,
  scoreLabel,
  topByScore,
} from '../../../lib/mapIntelligence';

export default function RecommendationsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const recs = topByScore(6);

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <Star className="h-3 w-3" /> Recomendações
        </>
      }
      title="Matching de regiões"
      description="Sugestões com base no Score LandMap e crescimento — mesmas regiões do mapa."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Sugestões" value={String(recs.length)} />
        <Stat label="Score mín." value="78" />
        <Stat label="Cobertura" value={String(INTELLIGENCE_REGIONS.length)} />
      </section>

      <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>
        Explorar no mapa
      </Link>

      <Reveal className="mt-6 space-y-3">
        {recs.map((r, i) => (
          <Card key={r.id} variant="interactive" className="p-4">
            <Link href={lh('/map')} className="block">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">#{i + 1} match</p>
                  <p className="font-semibold">{r.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.city} · {fmtPriceSqm(r.priceSqm)}/m² · {fmtDelta(r.priceSqmDelta12m)}
                  </p>
                </div>
                <Badge variant={r.score >= 80 ? 'success' : 'info'}>
                  {scoreLabel(r.score)} · {r.score}
                </Badge>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> crescimento
                  </span>
                  <span>{r.layerScores.growth}</span>
                </div>
                <Progress value={r.layerScores.growth} />
              </div>
              <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{r.highlights[0]}</p>
            </Link>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}

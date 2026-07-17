'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Building2, TrendingUp } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtPriceSqm,
  scoreLabel,
  topByScore,
} from '../../../lib/mapIntelligence';

export default function SalesPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const lots = topByScore(6);

  return (
    <ProductPageShell
      backHref="/map"
      eyebrow={
        <>
          <Building2 className="h-3 w-3" /> Terrenos
        </>
      }
      title="Vitrine de oportunidades"
      description="Regiões com melhor Score — use o mapa para camadas e dossiê."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Oportunidades" value={String(lots.length)} />
        <Stat label="Score top" value={String(lots[0]?.score ?? 0)} />
        <Stat label="Cobertura" value={String(INTELLIGENCE_REGIONS.length)} />
      </section>

      <div className="mt-4 flex gap-2">
        <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }))}>
          Mapa
        </Link>
        <Link href={lh('/leads')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Leads
        </Link>
      </div>

      <Reveal className="mt-6 space-y-3">
        {lots.map((r) => (
          <Card key={r.id} variant="interactive" className="p-4">
            <Link href={lh('/map')} className="block">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.city} · {fmtPriceSqm(r.priceSqm)}/m² · {r.zoning}
                  </p>
                </div>
                <Badge variant={r.score >= 80 ? 'success' : 'info'}>
                  {scoreLabel(r.score)}
                </Badge>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                {r.highlights[0]}
              </p>
            </Link>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}

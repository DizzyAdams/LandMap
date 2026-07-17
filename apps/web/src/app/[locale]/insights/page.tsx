'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, TrendingUp } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Sparkline, buttonVariants, cn } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtDelta,
  topByValorization,
} from '../../../lib/mapIntelligence';

export default function InsightsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const tops = topByValorization(5);
  const spark = tops.map((r) => Math.round(r.priceSqmDelta12m * 10));

  return (
    <ProductPageShell
      backHref="/market"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Insights
        </>
      }
      title="Insights de mercado"
      description="Síntese narrativa a partir das camadas do mapa intelligence."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Insights" value="5" />
        <Stat label="Top 12m" value={tops[0]?.name ?? '—'} />
        <Stat label="Delta max" value={fmtDelta(tops[0]?.priceSqmDelta12m ?? 0)} />
      </section>

      <Card className="mt-6 p-4">
        <p className="mb-2 text-xs text-muted-foreground">Dispersão de valorização (amostra)</p>
        <Sparkline data={spark} width={280} height={48} />
      </Card>

      <Reveal className="mt-6 space-y-3">
        {tops.map((r, i) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge variant="outline">#{i + 1}</Badge>
                <p className="mt-2 font-semibold">{r.name}</p>
                <p className="mt-1 text-sm text-foreground/70">{r.highlights[0]}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                {fmtDelta(r.priceSqmDelta12m)}
              </span>
            </div>
          </Card>
        ))}
      </Reveal>

      <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }), 'mt-6')}>
        Validar no mapa
      </Link>
    </ProductPageShell>
  );
}

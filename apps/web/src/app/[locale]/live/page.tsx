'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { Activity } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';
import { INTELLIGENCE_REGIONS, fmtDelta } from '../../../lib/mapIntelligence';

export default function LivePage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 4000);
    return () => clearInterval(t);
  }, []);

  const feed = INTELLIGENCE_REGIONS.map((r, i) => ({
    id: `${r.id}-${tick}-${i}`,
    text:
      tick % 2 === 0
        ? `Score ${r.name} estável em ${r.score}`
        : `Valorização 12m ${r.name}: ${fmtDelta(r.priceSqmDelta12m)}`,
    region: r.name,
  })).slice(0, 8);

  return (
    <ProductPageShell
      backHref="/map"
      eyebrow={
        <>
          <Activity className="h-3 w-3 animate-pulse" /> Ao vivo
        </>
      }
      title="Pulse do mercado"
      description="Feed simulado a partir das regiões do mapa intelligence."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Eventos" value={String(feed.length)} />
        <Stat label="Regiões" value={String(INTELLIGENCE_REGIONS.length)} />
        <Stat label="Tick" value={String(tick)} />
      </section>

      <Link href={lh('/map')} className={cn(buttonVariants({ size: 'sm' }), 'mt-4')}>
        Mapa live
      </Link>

      <div className="mt-6 space-y-2">
        {feed.map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-3">
            <p className="text-sm">{e.text}</p>
            <Badge variant="outline">{e.region}</Badge>
          </Card>
        ))}
      </div>
    </ProductPageShell>
  );
}

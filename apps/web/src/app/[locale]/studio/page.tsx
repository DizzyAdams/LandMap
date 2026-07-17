'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, Layers } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';
import { INTELLIGENCE_LAYERS } from '../../../lib/mapIntelligence';

export default function StudioPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/map"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Studio
        </>
      }
      title="Studio de camadas"
      description="Escolha camadas do mapa intelligence e abra a visualização full-bleed."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Camadas" value={String(INTELLIGENCE_LAYERS.length)} />
        <Stat label="Motor" value="Leaflet" />
        <Stat label="Padrão" value="Lovable" />
      </section>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {INTELLIGENCE_LAYERS.map((l) => (
          <Card key={l.id} variant="interactive" className="p-3">
            <Link href={lh('/map')} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Layers className="h-3.5 w-3.5 text-primary" />
                {l.label}
              </span>
              <Badge variant="outline">abrir</Badge>
            </Link>
          </Card>
        ))}
      </div>

      <Link href={lh('/map')} className={cn(buttonVariants(), 'mt-6')}>
        Abrir mapa intelligence
      </Link>
    </ProductPageShell>
  );
}

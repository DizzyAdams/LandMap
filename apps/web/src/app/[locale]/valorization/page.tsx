'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, TrendingUp, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { Sparkline } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const ROWS = [
  { name: 'Pinheiros', city: 'São Paulo', series: [8, 9, 9.5, 10.2, 11, 11.8], pct: 11.8 },
  { name: 'Batel', city: 'Curitiba', series: [6, 7, 7.5, 8.4, 9, 9.8], pct: 9.8 },
  { name: 'Campeche', city: 'Florianópolis', series: [9, 10, 11, 12, 12.8, 13.5], pct: 13.5 },
  { name: 'Savassi', city: 'Belo Horizonte', series: [5, 6, 6.5, 7.2, 8, 8.4], pct: 8.4 },
];

export default function ValorizationPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/market')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <TrendingUp className="h-3 w-3" />
          Valorização
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Bairros em alta</h1>
        <p className="mt-2 text-sm text-foreground/60">Top regiões por valorização em 12 meses.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Maior alta" value="13.5%" trend={14} />
        <Stat label="Regiões" value="4" />
        <Stat label="Tendência" value="alta" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {ROWS.map((r) => (
          <Card key={r.name} variant="interactive">
            <Link href={lh('/neighborhoods')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{r.name}</p>
                  <Badge variant="info">{r.city}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-primary">
                  <Sparkles className="h-3 w-3" />
                  {r.pct}% em 12m
                </p>
              </div>
              <Sparkline data={r.series} width={88} height={32} />
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}

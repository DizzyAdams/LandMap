'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, MapPin, TrendingUp } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const CITIES = [
  { city: 'São Paulo', neighborhoods: 8, var: 11.2, tag: 'maior liquidez' },
  { city: 'Curitiba', neighborhoods: 6, var: 9.8, tag: 'risco baixo' },
  { city: 'Florianópolis', neighborhoods: 5, var: 13.5, tag: 'maior alta' },
  { city: 'Belo Horizonte', neighborhoods: 5, var: 8.4, tag: 'yield alto' },
  { city: 'Porto Alegre', neighborhoods: 4, var: 7.1, tag: 'estável' },
  { city: 'Recife', neighborhoods: 4, var: 10.3, tag: 'em ascensão' },
];

export default function CitiesPage() {
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
          <MapPin className="h-3 w-3" />
          Cidades
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Guia de cidades</h1>
        <p className="mt-2 text-sm text-foreground/60">Cobertura LandMap por cidade.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Cidades" value="10" />
        <Stat label="Bairros" value="42" />
        <Stat label="Alta média" value="10.7%" trend={11} />
      </section>

      <Reveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CITIES.map((c) => (
          <Card key={c.city} variant="interactive">
            <Link href={lh('/neighborhoods')} className="block">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{c.city}</p>
                <Badge variant="outline">{c.neighborhoods} bairros</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.tag}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-primary">
                  <TrendingUp className="h-3 w-3" />
                  {c.var}%
                </span>
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}

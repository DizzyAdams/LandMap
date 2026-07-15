'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, MapPin, Star, TrendingUp } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const HOODS = [
  { city: 'São Paulo', name: 'Pinheiros', score: 94, var: 11.8, m2: 11200 },
  { city: 'Curitiba', name: 'Batel', score: 91, var: 9.8, m2: 7800 },
  { city: 'Florianópolis', name: 'Campeche', score: 88, var: 13.5, m2: 13400 },
  { city: 'Belo Horizonte', name: 'Savassi', score: 86, var: 8.4, m2: 6900 },
];

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function NeighborhoodsPage() {
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
          Bairros
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Ranking de bairros</h1>
        <p className="mt-2 text-sm text-foreground/60">Score composto por valorização, liquidez e risco.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Bairros" value="12" />
        <Stat label="Score médio" value="90" trend={5} />
        <Stat label="Cidades" value="4" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {HOODS.map((h) => (
          <Card key={`${h.city}-${h.name}`} variant="interactive">
            <Link href={lh('/sales')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{h.name}</p>
                  <Badge variant="info">{h.score}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{h.city}</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{fmtBRL(h.m2)}/m²</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                {h.var}%
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Star className="h-4 w-4" />
        Dados ilustrativos — plugar base real em /api/market.
      </div>
    </main>
  );
}

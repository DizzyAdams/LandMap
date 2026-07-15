'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Building2, TrendingUp, MapPin } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const CITIES = [
  { city: 'São Paulo', var: 11.2, price: 9800, tag: 'liquidez alta' },
  { city: 'Curitiba', var: 9.8, price: 7400, tag: 'risco baixo' },
  { city: 'Florianópolis', var: 13.5, price: 12800, tag: 'demanda forte' },
  { city: 'Belo Horizonte', var: 8.4, price: 6500, tag: 'yield atrativo' },
];

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function MarketPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Building2 className="h-3 w-3" />
          Mercado imobiliário
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Visão geral do mercado</h1>
        <p className="mt-2 text-sm text-foreground/60">Panorama de valorização e preço/m² nas principais cidades.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Cidades" value="10" />
        <Stat label="Valorização média" value="10.7%" trend={12} />
        <Stat label="Terrenos" value="1.5k" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {CITIES.map((c) => (
          <Card key={c.city} variant="interactive">
            <Link href={lh('/neighborhoods')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{c.city}</p>
                  <Badge variant="outline">{c.tag}</Badge>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{fmtBRL(c.price)}/m²</p>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                {c.var}%
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}

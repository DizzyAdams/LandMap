'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Star, TrendingUp, MapPin } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Rec = {
  city: string;
  neighborhood: string;
  match: number;
  pricePerM2: number;
  reason: string;
};

const RECS: Rec[] = [
  { city: 'Curitiba', neighborhood: 'Batel', match: 94, pricePerM2: 7800, reason: 'Alta liquidez + valorização acima da média' },
  { city: 'Belo Horizonte', neighborhood: 'Savassi', match: 91, pricePerM2: 6900, reason: 'Risco baixo + yield atrativo' },
  { city: 'Florianópolis', neighborhood: 'Campeche', match: 88, pricePerM2: 13400, reason: 'Demanda aquecida de fora do estado' },
];

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function RecommendationsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/assistant')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Star className="h-3 w-3" />
          Recomendações
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Match inteligente</h1>
        <p className="mt-2 text-sm text-foreground/60">Terrenos rankeados pelo seu perfil de investimento.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Recomendações" value="3" />
        <Stat label="Match médio" value="91%" trend={6} />
        <Stat label="Cidades" value="3" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {RECS.map((r) => (
          <Card key={`${r.city}-${r.neighborhood}`} variant="interactive">
            <Link href={lh('/sales')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{r.neighborhood}</p>
                  <Badge variant="info">{r.match}% match</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.city}</p>
                <p className="mt-2 font-mono text-lg font-semibold tabular-nums">{fmtBRL(r.pricePerM2)}/m²</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {r.reason}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}

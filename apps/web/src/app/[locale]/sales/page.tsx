'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Sparkles, Building2, TrendingUp, ShieldCheck } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Listing = {
  city: string;
  neighborhood: string;
  areaM2: number;
  price: number;
  yield: number;
  status: 'disponivel' | 'reservado' | 'vendido';
};

const LISTINGS: Listing[] = [
  { city: 'São Paulo', neighborhood: 'Vila Madalena', areaM2: 480, price: 3400000, yield: 7.8, status: 'disponivel' },
  { city: 'Curitiba', neighborhood: 'Água Verde', areaM2: 620, price: 2100000, yield: 8.4, status: 'disponivel' },
  { city: 'Florianópolis', neighborhood: 'Campeche', areaM2: 540, price: 4200000, yield: 6.9, status: 'reservado' },
  { city: 'Belo Horizonte', neighborhood: 'Lourdes', areaM2: 390, price: 1850000, yield: 9.1, status: 'disponivel' },
  { city: 'Recife', neighborhood: 'Boa Viagem', areaM2: 510, price: 2600000, yield: 7.2, status: 'vendido' },
  { city: 'Porto Alegre', neighborhood: 'Auxiliadora', areaM2: 430, price: 1980000, yield: 8.0, status: 'disponivel' },
];

const statusVariant = (s: Listing['status']) =>
  s === 'disponivel' ? 'success' : s === 'reservado' ? 'warning' : 'outline';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function SalesPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/map')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Building2 className="h-3 w-3" />
          Terrenos à venda
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Oportunidades de aquisição</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Terrenos curados com potencial de valorização validado pelo radar LandMap.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Anúncios ativos" value="4" />
        <Stat label="Yield médio" value="8,1%" trend={3.2} />
        <Stat label="Cidades" value="6" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {LISTINGS.map((it) => (
          <Card key={`${it.city}-${it.neighborhood}`} variant={it.status === 'disponivel' ? 'interactive' : 'default'}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{it.neighborhood}</p>
                  <Badge variant={statusVariant(it.status)}>{it.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{it.city}</p>
                <p className="mt-2 font-mono text-lg font-semibold tabular-nums">{fmtBRL(it.price)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {it.areaM2} m² · yield{' '}
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    <TrendingUp className="h-3 w-3" />
                    {it.yield}%
                  </span>
                </p>
              </div>
              {it.status === 'disponivel' && (
                <Link
                  href={lh('/auth')}
                  className="inline-flex h-9 items-center rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-glow"
                >
                  Tenho interesse
                </Link>
              )}
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Transações intermediadas pelo time LandMap.
      </div>
    </main>
  );
}
